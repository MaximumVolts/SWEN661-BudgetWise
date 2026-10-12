import 'dart:async' show StreamController;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/budget.dart'
    show BudgetCategory, BudgetCategoryDetailData, BudgetOverview, BudgetPeriod, BudgetSetting, BudgetStatus, BudgetSummary;
import '../models/transaction.dart' show CategoryInfo, TransactionItem;
import '../repositories/budget_repository.dart' show BudgetRepository;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import 'bank_categories.dart' show BankCategories;
import 'calendar.dart' show Calendar;
import 'budget_service.dart' show BudgetService;
import 'date_labels.dart' show DateLabels;
import '../models/money.dart' show Money;
import 'plaid_spending_service.dart' show PlaidSpendingService;
import 'plaid_transaction_service.dart' show PlaidTransactionService;

/// [BudgetService]: the user's own monthly limits per category (stored via [BudgetRepository]),
/// with "spent" from the linked banks' transactions in Plaid (sandbox).
/// BUSINESS RULES: periods are calendar months (this month + the two before); a budget's limit
/// applies to every month, while "spent" only counts that month's transactions; status thresholds (over = above the limit, near = 80%+ used or on pace to go over);
/// the pace projection; one budget per spending category per month, with a limit between $1 and
/// $1,000,000.
class PlaidBudgetService extends AnnotatedBankDataService implements BudgetService {
  static const _nearLimit = 0.8;
  static const _minLimit = 1.0;
  static const _maxLimit = 1000000.0;
  static final _periodPattern = RegExp(r'^(\d{4})-(0[1-9]|1[0-2])$');

  final BudgetRepository _budgets;
  final String? Function() _currentUserId;
  final _changes = StreamController<void>.broadcast();

  PlaidBudgetService(
    super.bankData,
    super.annotations, {
    required BudgetRepository budgets,
    required String? Function() currentUserId,
    super.now,
  })  : _budgets = budgets,
        _currentUserId = currentUserId;

  @override
  Stream<void> get changes => _changes.stream;

  /// The signed-in user's limits by category id (the same for every month; empty when signed out).
  Future<Map<String, double>> _limits() async {
    final userId = _currentUserId();
    return userId == null ? const {} : _budgets.limitsFor(userId);
  }

  @override
  Future<List<BudgetPeriod>> getPeriods() async {
    final now = currentTime();
    return [for (var i = 0; i < 3; i++) _periodOf(DateTime(now.year, now.month - i, 1))];
  }

  @override
  Future<BudgetOverview> getOverview(String periodId) async {
    final id = _resolve(periodId);
    final (start, end) = _bounds(id);
    final spentBy = await _spentByCategory(start, end);
    final categories = [
      for (final e in (await _limits()).entries)
        BudgetCategory(
          id: e.key,
          name: BankCategories.byId(e.key).name,
          iconKey: BankCategories.byId(e.key).iconKey,
          spent: spentBy[e.key] ?? 0,
          limit: e.value,
          status: _status(spentBy[e.key] ?? 0, e.value, start, end),
        ),
    ]..sort((a, b) => (b.spent / b.limit).compareTo(a.spent / a.limit));
    final spent = categories.fold(0.0, (s, c) => s + c.spent);
    final limit = categories.fold(0.0, (s, c) => s + c.limit);
    final status = _status(spent, limit, start, end);
    final pct = limit <= 0 ? 0 : (spent / limit * 100).round();
    return BudgetOverview(
      summary: BudgetSummary(
        periodLabel: DateLabels.monthName(start.month),
        spent: spent,
        limit: limit,
        status: status,
        statusLabel: categories.isEmpty
            ? 'No budgets yet'
            : '${status == BudgetStatus.over ? 'Over budget' : 'Under budget'} · $pct% used',
      ),
      categories: categories,
    );
  }

  @override
  Future<BudgetCategoryDetailData> getCategoryDetail({required String categoryId, required String periodId}) async {
    final id = _resolve(periodId);
    final (start, end) = _bounds(id);
    final category = BankCategories.byId(categoryId);
    final limit = (await _limits())[category.id] ?? 0;
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final txs = [
      for (final t in PlaidSpendingService.spending(snap, overrides, start, end))
        if (BankCategories.of(t, overrides).id == category.id) t,
    ];
    final spent = txs.fold(0.0, (s, t) => s + t.amount);
    final pace = _pace(spent, limit, start, end);
    return BudgetCategoryDetailData(
      name: category.name,
      periodLabel: 'Spent in ${DateLabels.monthName(start.month)}',
      spent: spent,
      limit: limit,
      status: _status(spent, limit, start, end),
      paceHeadline: pace?.$1,
      paceBody: pace?.$2,
      recent: <TransactionItem>[for (final t in txs.take(5)) PlaidTransactionService.itemFor(t, snap, overrides)],
    );
  }

  // ── Managing budgets ──────────────────────────────────────────────────────

  @override
  Future<List<BudgetSetting>> budgets() async => [
        for (final e in (await _limits()).entries)
          BudgetSetting(
            categoryId: e.key,
            name: BankCategories.byId(e.key).name,
            iconKey: BankCategories.byId(e.key).iconKey,
            monthlyLimit: e.value,
          ),
      ];

  @override
  Future<List<CategoryInfo>> availableCategories({String? editingCategoryId}) async {
    final taken = (await _limits()).keys.toSet()..remove(editingCategoryId);
    return [for (final c in BankCategories.spendingCategories) if (!taken.contains(c.id)) c];
  }

  @override
  Future<void> createBudget({required String? categoryId, required String limit}) async {
    final userId = _requireUser();
    final current = await _limits();
    final spending = {for (final c in BankCategories.spendingCategories) c.id};
    final amount = parseLimit(limit);
    final errors = <String, String>{
      if (categoryId == null || categoryId.isEmpty)
        'category': 'Choose a category'
      else if (current.containsKey(categoryId))
        'category': 'This category already has a budget'
      else if (!spending.contains(categoryId))
        'category': 'Budgets can only be set for spending categories',
      if (amount.error case final e?) 'limit': e,
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);
    await _budgets.save(userId, categoryId!, amount.value!);
    _changes.add(null);
  }

  @override
  Future<void> updateBudget({required String categoryId, String? newCategoryId, required String limit}) async {
    final userId = _requireUser();
    final current = await _limits();
    if (!current.containsKey(categoryId)) throw const AppException('That budget no longer exists.');
    final target = newCategoryId ?? categoryId;
    final spending = {for (final c in BankCategories.spendingCategories) c.id};
    final amount = parseLimit(limit);
    final errors = <String, String>{
      if (target != categoryId && current.containsKey(target))
        'category': 'This category already has a budget'
      else if (!spending.contains(target))
        'category': 'Budgets can only be set for spending categories',
      if (amount.error case final e?) 'limit': e,
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);
    await _budgets.replace(userId, categoryId, target, amount.value!);
    _changes.add(null);
  }

  @override
  Future<void> deleteBudget(String categoryId) async {
    final userId = _requireUser();
    await _budgets.delete(userId, categoryId);
    _changes.add(null);
  }

  @override
  Future<bool> hasBudget(String categoryId) async => (await _limits()).containsKey(categoryId);

  String _requireUser() {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in to manage your budgets.');
    return userId;
  }

  /// Parses what the user typed ("400", "$1,250.50"): an amount with at most 2 decimals, between
  /// $1 and $1,000,000.
  static ({double? value, String? error}) parseLimit(String text) {
    final cleaned = text.trim().replaceAll(RegExp(r'[\$,\s]'), '');
    if (cleaned.isEmpty) return (value: null, error: 'Enter a monthly limit');
    if (!RegExp(r'^\d+(\.\d{1,2})?$').hasMatch(cleaned)) {
      return (value: null, error: 'Enter an amount like 400 or 400.50');
    }
    final value = double.parse(cleaned);
    if (value < _minLimit) return (value: null, error: 'The limit must be at least \$1');
    if (value > _maxLimit) return (value: null, error: 'The limit can be at most \$1,000,000');
    return (value: value, error: null);
  }

  Future<Map<String, double>> _spentByCategory(DateTime start, DateTime end) async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final out = <String, double>{};
    for (final t in PlaidSpendingService.spending(snap, overrides, start, end)) {
      final id = BankCategories.of(t, overrides).id;
      out[id] = (out[id] ?? 0) + t.amount;
    }
    return out;
  }

  // ── Periods ───────────────────────────────────────────────────────────────

  /// '' -> this month's id; otherwise [periodId] itself, which must look like '2026-10'.
  String _resolve(String periodId) {
    if (periodId.isEmpty) return _periodId(currentTime());
    if (!_periodPattern.hasMatch(periodId)) throw AppException('"$periodId" is not a month.');
    return periodId;
  }

  BudgetPeriod _periodOf(DateTime month) {
    final now = currentTime();
    return BudgetPeriod(
      id: _periodId(month),
      label: DateLabels.monthName(month.month),
      isCurrent: month.year == now.year && month.month == now.month,
    );
  }

  /// "2026-10" -> Oct 1, 2026.
  static DateTime _start(String periodId) {
    final m = _periodPattern.firstMatch(periodId)!;
    return DateTime(int.parse(m[1]!), int.parse(m[2]!), 1);
  }

  /// "2026-10" -> [Oct 1, Nov 1).
  static (DateTime, DateTime) _bounds(String periodId) {
    final start = _start(periodId);
    return (start, DateTime(start.year, start.month + 1, 1));
  }

  static String _periodId(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}';

  /// How far through [start, end) today is (1.0 for past months).
  double _elapsed(DateTime start, DateTime end) {
    final now = currentTime();
    if (!now.isBefore(end)) return 1;
    final days = Calendar.daysBetween(start, end);
    return ((Calendar.daysBetween(start, now) + 1) / days).clamp(0.0, 1.0);
  }

  BudgetStatus _status(double spent, double limit, DateTime start, DateTime end) {
    if (limit <= 0) return BudgetStatus.onTrack;
    if (spent > limit) return BudgetStatus.over;
    final elapsed = _elapsed(start, end);
    final projected = elapsed <= 0 ? spent : spent / elapsed;
    return spent >= limit * _nearLimit || projected > limit ? BudgetStatus.nearLimit : BudgetStatus.onTrack;
  }

  /// Headline + body about the pace, for the current month only.
  (String, String)? _pace(double spent, double limit, DateTime start, DateTime end) {
    final now = currentTime();
    if (limit <= 0 || now.isBefore(start) || !now.isBefore(end)) return null;
    final days = Calendar.daysBetween(start, end);
    final dayOfMonth = now.day;
    final perDay = spent / dayOfMonth;
    final plannedPerDay = limit / days;
    final projected = perDay * days;
    final monthEnd = DateLabels.long(Calendar.addDays(end, -1)).split(',').first;
    if (projected > limit) {
      return (
        "You're spending ${Money.format(perDay - plannedPerDay)} more per day than planned.",
        "At this pace, you'll be ${Money.format(projected - limit, decimals: 0)} over budget by $monthEnd.",
      );
    }
    return (
      "You're on pace to stay within budget.",
      'At this pace, you\'ll spend about ${Money.format(projected, decimals: 0)} of ${Money.format(limit, decimals: 0)} by $monthEnd.',
    );
  }
}
