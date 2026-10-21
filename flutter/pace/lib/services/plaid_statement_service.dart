import '../models/app_exception.dart' show AppException;
import '../models/bank_data.dart' show BankSnapshot;
import '../models/linked_bank.dart' show LinkedBankAccount;
import '../models/statement.dart'
    show Statement, StatementChoice, StatementFile, StatementFormat, StatementLine, StatementOptions;
import '../repositories/statement_saver.dart' show StatementSaver;
import 'bank_categories.dart' show BankCategories;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import 'date_labels.dart' show DateLabels;
import 'statement_encoders.dart' show StatementEncoder;
import 'statement_service.dart' show StatementService;

/// [StatementService] over the linked banks' transactions from Plaid (sandbox).
/// BUSINESS RULES: the last [monthsOffered] calendar months can be exported, per account or for
/// all of them; a statement lists the month's posted transactions (pending ones aren't final yet),
/// oldest first, with the user's categories and notes; money in / out are its totals.
class PlaidStatementService extends AnnotatedBankDataService implements StatementService {
  static const monthsOffered = 6;
  static final _monthId = RegExp(r'^(\d{4})-(0[1-9]|1[0-2])$');

  final StatementSaver _saver;
  PlaidStatementService(super.bankData, super.annotations, {required StatementSaver saver, super.now}) : _saver = saver;

  @override
  Future<StatementOptions> options() async {
    final snap = await bankData.load();
    if (!snap.isLinked) return const StatementOptions(accounts: [], months: []);
    final now = currentDate();
    return StatementOptions(
      accounts: [
        const StatementChoice(id: '', label: 'All accounts'),
        for (final a in snap.accounts)
          if (snap.transactions.any((t) => t.accountId == a.accountId)) StatementChoice(id: a.accountId, label: _accountLabel(a)),
      ],
      months: [
        for (var i = 0; i < monthsOffered; i++)
          () {
            final m = DateTime(now.year, now.month - i);
            return StatementChoice(id: _id(m), label: '${DateLabels.monthName(m.month)} ${m.year}');
          }(),
      ],
    );
  }

  @override
  Future<Statement> statement({required String accountId, required String monthId}) async {
    final m = _monthId.firstMatch(monthId);
    if (m == null) throw AppException('"$monthId" is not a month.');
    final start = DateTime(int.parse(m[1]!), int.parse(m[2]!));
    final end = DateTime(start.year, start.month + 1);

    final snap = await bankData.load();
    if (!snap.transactionsReady && snap.transactions.isEmpty) {
      throw const AppException("Your test bank's transactions are still loading. Try again in a few seconds.");
    }
    final account = accountId.isEmpty ? null : snap.account(accountId);
    if (accountId.isNotEmpty && account == null) throw const AppException('That account is no longer linked.');

    final overrides = await annotations.categoryOverrides();
    final notes = await annotations.notes();
    final txs = [
      for (final t in snap.transactions)
        if (!t.pending && !t.date.isBefore(start) && t.date.isBefore(end) && (account == null || t.accountId == accountId)) t,
    ]..sort((a, b) => a.date.compareTo(b.date));
    final lines = [
      for (final t in txs)
        StatementLine(
          date: t.date,
          description: t.displayName,
          category: BankCategories.allOf(t, overrides).map((c) => c.name).join(' + '),
          account: _accountName(snap, t.accountId),
          amount: t.signedAmount,
          note: notes[t.transactionId] ?? '',
        ),
    ];
    return Statement(
      accountLabel: account == null ? 'All accounts' : _accountLabel(account),
      periodLabel: '${DateLabels.monthName(start.month)} ${start.year}',
      periodId: monthId,
      generatedOn: currentDate(),
      lines: lines,
      moneyIn: lines.where((l) => l.amount > 0).fold(0.0, (s, l) => s + l.amount),
      moneyOut: lines.where((l) => l.amount < 0).fold(0.0, (s, l) => s - l.amount),
    );
  }

  @override
  Future<String?> download({required String accountId, required String monthId, required StatementFormat format}) async {
    final s = await statement(accountId: accountId, monthId: monthId);
    final encoder = StatementEncoder.all[format]!;
    final file = StatementFile(
      fileName: fileName(s, format),
      mimeType: format.mimeType,
      bytes: await encoder.encode(s),
    );
    return await _saver.save(file) ? file.fileName : null;
  }

  /// "pace-statement-2026-10-all-accounts.pdf", "pace-statement-2026-10-plaid-checking-0000.csv"
  static String fileName(Statement s, StatementFormat format) {
    final slug = s.accountLabel.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-+|-+$'), '');
    return 'pace-statement-${s.periodId}-$slug.${format.extension}';
  }

  static String _id(DateTime m) => '${m.year}-${m.month.toString().padLeft(2, '0')}';

  /// "Plaid Checking - 0000" (plain characters, so it prints in any file format).
  static String _accountLabel(LinkedBankAccount a) => a.mask == null ? a.name : '${a.name} - ${a.mask}';

  static String _accountName(BankSnapshot snap, String accountId) {
    final a = snap.account(accountId);
    return a == null ? '' : _accountLabel(a);
  }
}
