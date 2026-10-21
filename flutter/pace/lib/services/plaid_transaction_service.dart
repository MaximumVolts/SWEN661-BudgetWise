import '../models/bank_data.dart' show BankSnapshot, BankTransaction;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/transaction.dart'
    show
        CategoryInfo,
        FilterChoice,
        FilterKind,
        TransactionDetailBundle,
        TransactionDetailData,
        TransactionGroup,
        TransactionItem,
        TransactionQuery;
import '../models/app_exception.dart' show AppException;
import 'bank_categories.dart' show BankCategories;
import 'calendar.dart' show Calendar;
import 'date_labels.dart' show DateLabels;
import 'transaction_service.dart' show TransactionService;

/// [TransactionService] over the linked banks' transactions from Plaid (sandbox).
/// BUSINESS RULES: filtering, searching ([matchesSearch]), grouping by day with daily totals, category overrides and notes
/// (kept by Pace, never sent to the bank), pending vs posted labels.
class PlaidTransactionService extends AnnotatedBankDataService implements TransactionService {
  static const _dateRanges = {'7d': ('Last 7 days', 7), '30d': ('Last 30 days', 30), '90d': ('Last 90 days', 90)};

  PlaidTransactionService(super.bankData, super.annotations, {super.now});

  @override
  Future<List<TransactionGroup>> getGroups(TransactionQuery query) async {
    final snap = await bankData.load();
    if (!snap.transactionsReady && snap.transactions.isEmpty) {
      throw const AppException("Your test bank's transactions are still loading. They'll appear here in a few seconds.");
    }
    final overrides = await annotations.categoryOverrides();
    final today = currentDate();
    final days = _dateRanges[query.date?.id]?.$2;
    final words = searchWords(query.search);
    final notes = words.isEmpty ? const <String, String>{} : await annotations.notes();
    final matches = [
      for (final t in snap.transactions)
        if ((query.account == null || t.accountId == query.account!.id) &&
            (query.category == null || BankCategories.has(t, overrides, query.category!.id)) &&
            (days == null || !t.date.isBefore(Calendar.addDays(today, -(days - 1)))) &&
            (words.isEmpty || matchesSearch(t, words, snap, overrides, notes[t.transactionId])))
          t,
    ];

    final groups = <TransactionGroup>[];
    for (final t in matches) {
      final item = _item(t, snap, overrides);
      if (groups.isNotEmpty && groups.last.dayLabel == DateLabels.short(t.date)) {
        final g = groups.removeLast();
        groups.add(TransactionGroup(dayLabel: g.dayLabel, total: g.total + item.amount, items: [...g.items, item]));
      } else {
        groups.add(TransactionGroup(dayLabel: DateLabels.short(t.date), total: item.amount, items: [item]));
      }
    }
    return groups;
  }

  @override
  Future<List<FilterChoice>> getFilterChoices(FilterKind kind) async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    return switch (kind) {
      FilterKind.account => [
          for (final a in snap.accounts)
            if (snap.transactions.any((t) => t.accountId == a.accountId))
              FilterChoice(id: a.accountId, label: a.mask == null ? a.name : '${a.name} ••${a.mask}'),
        ],
      FilterKind.category => [
          for (final c in BankCategories.all)
            if (snap.transactions.any((t) => BankCategories.has(t, overrides, c.id))) FilterChoice(id: c.id, label: c.name),
        ],
      FilterKind.date => [for (final e in _dateRanges.entries) FilterChoice(id: e.key, label: e.value.$1)],
    };
  }

  @override
  Future<TransactionDetailBundle> getDetail(String transactionId) async {
    final snap = await bankData.load();
    final t = _find(snap, transactionId);
    final overrides = await annotations.categoryOverrides();
    final category = BankCategories.of(t, overrides);
    final account = snap.account(t.accountId);
    return TransactionDetailBundle(
      transaction: TransactionDetailData(
        id: t.transactionId,
        title: t.displayName,
        iconKey: category.iconKey,
        amount: t.signedAmount,
        dateLabel: DateLabels.long(t.date),
        accountLabel: account == null ? 'Linked account' : '${account.name}${account.mask == null ? '' : ' ••${account.mask}'}',
        statusLabel: t.pending ? 'Pending' : 'Posted ${DateLabels.short(t.date)}',
        merchantLabel: t.name,
        selectedCategoryIds: [for (final c in BankCategories.allOf(t, overrides)) c.id],
      ),
      categories: BankCategories.all,
    );
  }

  @override
  Future<List<CategoryInfo>> getCategories() async => BankCategories.all;

  /// Keeps the given order (first = primary), drops duplicates and unknown ids.
  @override
  Future<void> setCategories({required String transactionId, required List<String> categoryIds}) async {
    _find(await bankData.load(), transactionId);
    final known = {for (final c in BankCategories.all) c.id};
    final ids = <String>[];
    for (final id in categoryIds) {
      if (known.contains(id) && !ids.contains(id)) ids.add(id);
    }
    if (ids.isEmpty) throw const AppException('Choose at least one category.');
    await annotations.setCategoryOverride(transactionId, ids);
  }

  @override
  Future<void> setNote({required String transactionId, required String note}) =>
      annotations.setNote(transactionId, note.trim());

  static BankTransaction _find(BankSnapshot snap, String id) {
    for (final t in snap.transactions) {
      if (t.transactionId == id) return t;
    }
    throw const AppException('That transaction is no longer available from your bank.');
  }

  /// A row in the list: "Uber" / "Transportation + Travel · Plaid Checking · Pending"
  /// (primary category first; its icon is the row's icon).
  static TransactionItem _item(BankTransaction t, BankSnapshot snap, Map<String, List<String>> overrides) {
    final categories = BankCategories.allOf(t, overrides);
    final category = categories.first;
    final account = snap.account(t.accountId)?.name;
    return TransactionItem(
      id: t.transactionId,
      title: t.displayName,
      subtitle: [categories.map((c) => c.name).join(' + '), if (account != null) account, if (t.pending) 'Pending']
          .join(' · '),
      amount: t.signedAmount,
      iconKey: category.iconKey,
      highlight: t.signedAmount > 0,
    );
  }

  /// The search text as lower-case words ('' → none).
  static List<String> searchWords(String text) =>
      [for (final w in text.toLowerCase().split(RegExp(r'\s+'))) if (w.isNotEmpty) w];

  /// Search rule: every word must match the transaction, in any of: the merchant / bank
  /// descriptor, any of its categories, the account (name or last digits), its note, "pending",
  /// or the amount. A number matches the amount exactly ("12.50", "$12.50"), or by whole dollars
  /// when it has no cents ("12" finds $12.00 and $12.75), or a whole number in the text (the
  /// account digits "0000"); other words match anywhere in the text.
  static bool matchesSearch(BankTransaction t, List<String> words, BankSnapshot snap,
      Map<String, List<String>> overrides, String? note) {
    final account = snap.account(t.accountId);
    final text = [
      t.displayName,
      t.name,
      for (final c in BankCategories.allOf(t, overrides)) c.name,
      if (account != null) account.name,
      if (account?.mask != null) account!.mask!,
      if (t.pending) 'pending',
      if (note != null) note,
    ].join(' ').toLowerCase();
    final amount = t.amount.abs();
    final textWords = text.split(RegExp(r'[^a-z0-9.]+')).toSet();
    bool matches(String w) {
      final number = w.replaceAll(RegExp(r'[\$,]'), '');
      if (!RegExp(r'^-?\d+(\.\d{1,2})?$').hasMatch(number)) return text.contains(w);
      // Numbers match the amount, or a whole number in the text (e.g. account digits "0000"),
      // not any digits inside a longer number.
      final value = double.parse(number).abs();
      final amountMatches = number.contains('.') ? (amount - value).abs() < 0.005 : amount.floor() == value;
      return amountMatches || textWords.contains(number);
    }

    return words.every(matches);
  }

  /// For other services (dashboard, budgets): the same list row.
  static TransactionItem itemFor(BankTransaction t, BankSnapshot snap, Map<String, List<String>> overrides) =>
      _item(t, snap, overrides);
}
