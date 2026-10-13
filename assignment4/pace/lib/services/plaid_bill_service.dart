import 'dart:async' show StreamController;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import '../models/bank_data.dart' show BankSnapshot, RecurringStream;
import '../models/bill.dart' show BillItem, BillSection, BillsUpcomingData, RecurringData, RecurringItem, SubscriptionStatus;
import '../models/money.dart' show Money;
import '../models/recurring.dart'
    show BillDetailData, BillPayment, RecurringAction, RecurringExpense, RecurringFormOptions, RecurringFrequency, RecurringKind;
import '../models/transaction.dart' show CategoryInfo;
import '../repositories/recurring_expense_repository.dart'
    show InMemoryRecurringExpenseRepository, RecurringExpenseRepository;
import 'bank_categories.dart' show BankCategories;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import 'bill_service.dart' show BillService;
import 'calendar.dart' show Calendar;
import 'date_labels.dart' show DateLabels;
import 'recurring_schedule.dart' show RecurringSchedule;
import 'validators.dart' show Validators;

/// [BillService] over the recurring payments Plaid (sandbox) detects in the linked banks, plus
/// the recurring expenses the user adds (stored via [RecurringExpenseRepository]).
///
/// BUSINESS RULES: bills are recurring payments in the categories in [billCategories]; the rest are
/// subscriptions (the user picks for ones they add). "Upcoming" = next payment within 30 days (or
/// overdue, for detected ones); paid / paused are Pace's own marks (the bank isn't changed); monthly
/// cost normalises each frequency; a price change is the last charge differing from the one
/// before; only expenses the user added can be edited or deleted.
class PlaidBillService extends AnnotatedBankDataService implements BillService {
  static const _windowDays = 30;
  static const _maxNameLength = 40;
  static const _manualPrefix = 'manual-';
  /// Categories whose recurring payments are bills rather than subscriptions.
  static const billCategories = {'utilities', 'loans', 'home', 'medical', 'services', 'fees', 'transfers'};

  final RecurringExpenseRepository _expenses;
  final String? Function() _currentUserId;
  final _changes = StreamController<void>.broadcast();

  PlaidBillService(
    super.bankData,
    super.annotations, {
    RecurringExpenseRepository? recurring,
    String? Function()? currentUserId,
    super.now,
  })  : _expenses = recurring ?? InMemoryRecurringExpenseRepository(),
        _currentUserId = currentUserId ?? (() => null);

  @override
  Stream<void> get changes => _changes.stream;

  // ── Everything recurring, from both sources ───────────────────────────────

  /// Active recurring payments: the bank's (money out) and the user's own.
  Future<List<_Recurring>> _all() async {
    final snap = await bankData.load();
    final userId = _currentUserId();
    return [
      for (final s in snap.recurring)
        if (!s.isInflow && s.isActive) _BankRecurring(s, snap),
      if (userId != null)
        for (final e in await _expenses.listFor(userId)) _ManualRecurring(e),
    ];
  }

  Future<_Recurring> _find(String id) async {
    final r = (await _all()).where((r) => r.id == id).firstOrNull;
    if (r == null) throw const AppException('That bill or subscription is no longer tracked.');
    return r;
  }

  /// The next payment still to make: after the one marked paid, if any.
  DateTime? _nextDue(_Recurring r, Map<String, DateTime> paid) => r.nextDue(currentDate(), paid[r.id]);

  @override
  Future<List<({BillItem bill, DateTime due})>> upcomingWithDates() async {
    final today = currentDate();
    final paid = await annotations.paidBills();
    final paused = await annotations.pausedSubscriptions();
    final upcoming = <({BillItem bill, DateTime due})>[];
    for (final r in await _all()) {
      final due = _nextDue(r, paid);
      if (due == null || paused.contains(r.id) || !due.isBefore(Calendar.addDays(today, _windowDays))) continue;
      final overdue = due.isBefore(today);
      upcoming.add((
        due: due,
        bill: BillItem(
          id: r.id,
          title: r.name,
          subtitle: overdue ? 'Overdue · was due ${DateLabels.short(due)}' : 'Due ${DateLabels.short(due)}',
          amount: r.amount,
          iconKey: r.category.iconKey,
          isOverdue: overdue,
        ),
      ));
    }
    upcoming.sort((a, b) => a.due.compareTo(b.due));
    return upcoming;
  }

  Future<List<BillItem>> upcomingBills() async => [for (final u in await upcomingWithDates()) u.bill];

  @override
  Future<BillsUpcomingData> getUpcoming() async {
    final upcoming = await upcomingWithDates();
    final bills = [for (final u in upcoming) u.bill];
    final weekEnd = Calendar.addDays(currentDate(), 7);
    final soon = <BillItem>[], later = <BillItem>[];
    for (final u in upcoming) {
      (u.due.isBefore(weekEnd) ? soon : later).add(u.bill);
    }
    return BillsUpcomingData(
      summaryLabel: 'Due in the next 30 days',
      summaryAmount: bills.fold(0.0, (sum, b) => sum + b.amount),
      summaryDetail: bills.isEmpty ? 'No bills due in the next 30 days' : '${bills.length} bill${bills.length == 1 ? '' : 's'} scheduled',
      sections: [
        if (soon.isNotEmpty) BillSection(title: 'This week', items: soon),
        if (later.isNotEmpty) BillSection(title: 'Later', items: later),
      ],
    );
  }

  @override
  Future<RecurringData> getRecurring() async {
    final all = await _all();
    final paid = await annotations.paidBills();
    final paused = await annotations.pausedSubscriptions();
    var monthly = 0.0, subscriptions = 0.0;
    final items = <({RecurringItem item, DateTime? due})>[];
    for (final r in all) {
      final isPaused = paused.contains(r.id);
      final perMonth = r.monthlyCost;
      if (!isPaused) {
        monthly += perMonth;
        if (r.kind == RecurringKind.subscription) subscriptions += perMonth;
      }
      final due = _nextDue(r, paid);
      items.add((
        due: due,
        item: RecurringItem(
          id: r.id,
          name: r.name,
          iconKey: r.category.iconKey,
          detailLine: [
            '${Money.format(r.amount)} ${r.frequency.adverb}',
            if (isPaused) 'paused' else if (due != null) 'next ${DateLabels.short(due)}',
          ].join(' · '),
          yearlyLine: isPaused ? '\$0 a year while paused' : '${Money.format(perMonth * 12)} a year',
          status: isPaused ? SubscriptionStatus.paused : SubscriptionStatus.active,
          kind: r.kind,
          isManual: r.isManual,
          priceChangeLine: r.priceChange,
        ),
      ));
    }
    // Active ones first, soonest payment first.
    items.sort((a, b) {
      if (a.item.isPaused != b.item.isPaused) return a.item.isPaused ? 1 : -1;
      return (a.due ?? DateTime(9999)).compareTo(b.due ?? DateTime(9999));
    });
    return RecurringData(
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
      subscriptionsMonthly: subscriptions,
      items: [for (final i in items) i.item],
      insight: _insight(all, paused),
    );
  }

  /// A price increase is the most useful thing to point out; otherwise the biggest cost.
  static String _insight(List<_Recurring> all, Set<String> paused) {
    final active = [for (final r in all) if (!paused.contains(r.id)) r];
    if (active.isEmpty) return 'No recurring payments yet. Add one with + or link a bank to detect them.';
    final increased = active.where((r) => r.priceWentUp).firstOrNull;
    if (increased != null) return '${increased.name}: ${increased.priceChange!.toLowerCase()}.';
    final biggest = (active.toList()..sort((a, b) => b.monthlyCost.compareTo(a.monthlyCost))).first;
    return 'Your biggest recurring payment is ${biggest.name} at about ${Money.format(biggest.monthlyCost)} a month.';
  }

  @override
  Future<BillDetailData> getDetail(String id) async {
    final r = await _find(id);
    final paid = await annotations.paidBills();
    final isPaused = (await annotations.pausedSubscriptions()).contains(id);
    final due = _nextDue(r, paid);
    final today = currentDate();
    return BillDetailData(
      id: r.id,
      name: r.name,
      iconKey: r.category.iconKey,
      kind: r.kind,
      isManual: r.isManual,
      isPaused: isPaused,
      amountLabel: '${Money.format(r.amount)} ${r.frequency.adverb}',
      yearlyLabel: isPaused ? '\$0 a year while paused' : '${Money.format(r.monthlyCost * 12)} a year',
      nextLabel: isPaused
          ? 'Paused · not counted in your totals'
          : due == null
              ? 'No upcoming payment'
              : due.isBefore(today)
                  ? 'Overdue · was due ${DateLabels.long(due)}'
                  : 'Next payment ${DateLabels.long(due)}',
      categoryName: r.category.name,
      sourceLabel: r.sourceLabel,
      priceChangeLabel: r.priceChange,
      canMarkPaid: !isPaused && due != null && due.isBefore(Calendar.addDays(today, _windowDays)),
      history: r.history,
    );
  }

  @override
  List<RecurringAction> actionsFor(RecurringItem item) => [
        RecurringAction.details,
        item.isPaused ? RecurringAction.resume : RecurringAction.pause,
        if (item.isManual) ...[RecurringAction.edit, RecurringAction.delete],
      ];

  @override
  Future<void> markPaid(String billId) async {
    final r = await _find(billId);
    final due = _nextDue(r, await annotations.paidBills());
    if (due == null) throw const AppException('There is no upcoming payment to mark as paid.');
    await annotations.markBillPaid(billId, due);
    _changes.add(null);
  }

  @override
  Future<void> setSubscriptionPaused({required String id, required bool paused}) async {
    await annotations.setSubscriptionPaused(id, paused);
    _changes.add(null);
  }

  // ── Recurring expenses the user adds ──────────────────────────────────────

  @override
  Future<RecurringFormOptions> formOptions({String? editingId}) async {
    RecurringExpense? editing;
    if (editingId != null) {
      final r = await _find(editingId);
      if (r is! _ManualRecurring) throw const AppException('Only bills and subscriptions you added can be edited.');
      editing = r.expense;
    }
    return RecurringFormOptions(
      categories: BankCategories.spendingCategories,
      frequencies: RecurringFrequency.choosable,
      kinds: RecurringKind.values,
      editing: editing,
    );
  }

  @override
  Future<void> saveRecurring({
    String? editingId,
    required String name,
    required String amount,
    required RecurringFrequency? frequency,
    required DateTime? firstDue,
    required String? categoryId,
    required RecurringKind? kind,
  }) async {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in to track bills and subscriptions.');
    String? storedId;
    if (editingId != null) {
      if (!editingId.startsWith(_manualPrefix)) throw const AppException('Only bills and subscriptions you added can be edited.');
      storedId = editingId.substring(_manualPrefix.length);
    }
    final spending = {for (final c in BankCategories.spendingCategories) c.id};
    final parsed = Validators.money(amount, what: 'amount', min: 0.01, max: 100000);
    final trimmed = name.trim();
    final errors = <String, String>{
      if (trimmed.isEmpty)
        'name': 'Enter a name'
      else if (trimmed.length > _maxNameLength)
        'name': 'Keep the name under $_maxNameLength characters',
      if (parsed.error case final e?) 'amount': e,
      if (frequency == null || !RecurringFrequency.choosable.contains(frequency)) 'frequency': 'Choose how often it\'s paid',
      if (firstDue == null) 'firstDue': 'Choose the date of the next payment',
      if (categoryId == null || !spending.contains(categoryId)) 'category': 'Choose a category',
      if (kind == null) 'kind': 'Choose bill or subscription',
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);
    await _expenses.save(
      userId,
      RecurringExpense(
        id: storedId ?? '',
        name: trimmed,
        amount: parsed.value!,
        frequency: frequency!,
        firstDue: Calendar.dateOnly(firstDue!),
        categoryId: categoryId!,
        kind: kind!,
      ),
    );
    _changes.add(null);
  }

  @override
  Future<void> deleteRecurring(String id) async {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in to track bills and subscriptions.');
    if (!id.startsWith(_manualPrefix)) throw const AppException('Bills your bank detected can be paused, not deleted.');
    await _expenses.delete(userId, id.substring(_manualPrefix.length));
    await annotations.setSubscriptionPaused(id, false);
    _changes.add(null);
  }
}

// ── The two kinds of recurring payment, behind one interface ────────────────

/// A recurring payment, whichever source it comes from.
abstract class _Recurring {
  String get id;
  String get name;
  /// A typical payment.
  double get amount;
  RecurringFrequency get frequency;
  CategoryInfo get category;
  RecurringKind get kind;
  bool get isManual;
  String get sourceLabel;

  /// e.g. "Price went up from $9.99 to $12.99"; null when it hasn't changed.
  String? get priceChange => null;
  bool get priceWentUp => false;

  double get monthlyCost => amount * RecurringSchedule.perMonth(frequency);

  /// The next payment to make, as of [today], after the one marked paid ([paid]).
  DateTime? nextDue(DateTime today, DateTime? paid);

  /// Payments made, newest first.
  List<BillPayment> get history => const [];

  static RecurringKind kindOf(CategoryInfo c) =>
      PlaidBillService.billCategories.contains(c.id) ? RecurringKind.bill : RecurringKind.subscription;
}

/// Detected by Plaid in the linked bank's transactions.
class _BankRecurring extends _Recurring {
  final RecurringStream s;
  final BankSnapshot snap;
  _BankRecurring(this.s, this.snap);

  @override
  String get id => s.streamId;
  @override
  String get name => s.displayName;
  @override
  double get amount => s.lastAmount;
  @override
  RecurringFrequency get frequency => RecurringFrequency.fromCode(s.frequency);
  @override
  CategoryInfo get category => BankCategories.forPlaid(s.categoryPrimary);
  @override
  RecurringKind get kind => _Recurring.kindOf(category);
  @override
  bool get isManual => false;
  @override
  double get monthlyCost => s.averageAmount * RecurringSchedule.perMonth(frequency);

  @override
  String get sourceLabel {
    final a = snap.account(s.accountId);
    if (a == null) return 'Detected by your bank';
    return 'Detected in ${a.name}${a.mask == null ? '' : ' - ${a.mask}'}';
  }

  /// The stream's charges, oldest first.
  List<double> get _charges {
    final txs = [for (final t in snap.transactions) if (s.transactionIds.contains(t.transactionId)) t]
      ..sort((a, b) => a.date.compareTo(b.date));
    return [for (final t in txs) t.amount.abs()];
  }

  @override
  String? get priceChange {
    final c = _charges;
    if (c.length < 2 || (c.last - c[c.length - 2]).abs() < 0.01) return null;
    final direction = c.last > c[c.length - 2] ? 'up' : 'down';
    return 'Price went $direction from ${Money.format(c[c.length - 2])} to ${Money.format(c.last)}';
  }

  @override
  bool get priceWentUp {
    final c = _charges;
    return c.length >= 2 && c.last > c[c.length - 2] + 0.005;
  }

  /// Plaid's predicted next date; once that one is marked paid, the one after it.
  @override
  DateTime? nextDue(DateTime today, DateTime? paid) {
    final next = s.nextDate;
    if (next == null) return null;
    if (paid != null && !paid.isBefore(next)) {
      return RecurringSchedule.occurrence(next, frequency, 1);
    }
    return next;
  }

  @override
  List<BillPayment> get history {
    final txs = [for (final t in snap.transactions) if (s.transactionIds.contains(t.transactionId)) t]
      ..sort((a, b) => b.date.compareTo(a.date));
    return [
      for (final t in txs) BillPayment(transactionId: t.transactionId, dateLabel: DateLabels.long(t.date), amount: t.signedAmount),
    ];
  }
}

/// Added by the user: payments fall on [RecurringExpense.firstDue], then every frequency after.
class _ManualRecurring extends _Recurring {
  final RecurringExpense expense;
  _ManualRecurring(this.expense);

  @override
  String get id => '${PlaidBillService._manualPrefix}${expense.id}';
  @override
  String get name => expense.name;
  @override
  double get amount => expense.amount;
  @override
  RecurringFrequency get frequency => expense.frequency;
  @override
  CategoryInfo get category => BankCategories.byId(expense.categoryId);
  @override
  RecurringKind get kind => expense.kind;
  @override
  bool get isManual => true;
  @override
  String get sourceLabel => 'Added by you';

  /// The first payment from today on, or after the one marked paid if that's later.
  @override
  DateTime nextDue(DateTime today, DateTime? paid) {
    final from = paid != null && !paid.isBefore(today) ? Calendar.addDays(paid, 1) : today;
    return RecurringSchedule.firstOnOrAfter(expense.firstDue, frequency, from);
  }
}
