import '../models/bank_data.dart' show RecurringStream;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/cash_flow.dart' show AmountTone, BreakdownLine, CashFlowChartData, CashFlowData;
import 'bank_categories.dart' show BankCategories;
import 'calendar.dart' show Calendar;
import 'cash_flow_service.dart' show CashFlowService;
import 'date_labels.dart' show DateLabels;
import '../models/money.dart' show Money;
import 'plaid_bill_service.dart' show PlaidBillService;

/// [CashFlowService] projecting cash from the linked banks in Plaid (sandbox).
/// BUSINESS RULES: cash today = checking + savings balances; recurring income and bills are
/// projected on their predicted dates; everyday spending = the last 90 days' non-recurring
/// average per day; the income scenario scales expected income (Low 85% / Expected / High 115%).
class PlaidCashFlowService extends AnnotatedBankDataService implements CashFlowService {
  static const _ranges = [('30 days', 30), ('60 days', 60), ('90 days', 90)];
  static const _scenarios = [('Low', 0.85), ('Expected', 1.0), ('High', 1.15)];

  PlaidCashFlowService(super.bankData, super.annotations, {super.now});

  @override
  Future<CashFlowData> getProjection({required int rangeIndex, required int scenarioIndex}) async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final range = _ranges[rangeIndex.clamp(0, _ranges.length - 1)];
    final scenario = _scenarios[scenarioIndex.clamp(0, _scenarios.length - 1)];
    final now = currentTime();
    final today = Calendar.dateOnly(now);
    final days = range.$2;
    final end = Calendar.addDays(today, days);

    final cashAccounts = [
      for (final a in snap.accounts)
        if (a.type == 'depository' && (a.subtype == 'checking' || a.subtype == 'savings')) a,
    ];
    final cashToday = cashAccounts.fold(0.0, (s, a) => s + (a.availableBalance ?? a.currentBalance ?? 0));

    // Each projected recurring payment: day offset → signed amount.
    final events = <({int day, double amount, String name})>[];
    final paused = await annotations.pausedSubscriptions();
    for (final s in snap.recurring.where((s) => s.isActive && !paused.contains(s.streamId))) {
      for (final date in _occurrences(s, today, end)) {
        final amount = s.isInflow ? s.averageAmount * scenario.$2 : -s.averageAmount;
        events.add((day: Calendar.daysBetween(today, date), amount: amount, name: s.displayName));
      }
    }
    final income = events.where((e) => e.amount > 0).fold(0.0, (s, e) => s + e.amount);
    final bills = -events.where((e) => e.amount < 0).fold(0.0, (s, e) => s + e.amount);

    // Everyday spending: last 90 days, excluding transactions Plaid tied to recurring streams.
    final recurringTx = {for (final s in snap.recurring) ...s.transactionIds};
    final since = Calendar.addDays(today, -90);
    final everyday = snap.transactions
        .where((t) => !recurringTx.contains(t.transactionId) && BankCategories.isSpending(t, overrides) && !t.date.isBefore(since))
        .fold(0.0, (s, t) => s + t.amount);
    final perDay = everyday / 90;

    // Daily balance, sampled weekly for the chart (plus the last day).
    final balances = <double>[];
    var balance = cashToday;
    for (var d = 0; d <= days; d++) {
      if (d > 0) balance -= perDay;
      for (final e in events.where((e) => e.day == d)) {
        balance += e.amount;
      }
      balances.add(balance);
    }
    final sampleDays = [for (var d = 0; d <= days; d += 7) d];
    if (sampleDays.last != days) sampleDays.add(days);
    final values = [for (final d in sampleDays) balances[d]];
    var lowDay = 0;
    for (var d = 1; d <= days; d++) {
      if (balances[d] < balances[lowDay]) lowDay = d;
    }
    final lowSample = sampleDays.indexWhere((d) => d >= lowDay).clamp(0, values.length - 1);
    final lowDate = Calendar.addDays(today, lowDay);
    final lowCause = events.where((e) => e.day == lowDay && e.amount < 0).map((e) => e.name).firstOrNull;
    final projected = balances.last;

    return CashFlowData(
      rangeLabels: [for (final r in _ranges) r.$1],
      selectedRange: rangeIndex.clamp(0, _ranges.length - 1),
      scenarioLabels: [for (final s in _scenarios) s.$1],
      selectedScenario: scenarioIndex.clamp(0, _scenarios.length - 1),
      projectedDateLabel: 'Projected cash on ${DateLabels.short(end)}',
      projectedAmount: projected,
      lowestAmount: balances[lowDay],
      lowestDescription: 'around ${DateLabels.short(lowDate)}${lowCause == null ? '' : ', after $lowCause'}',
      chartTitle: 'Cash over the next $days days',
      chart: CashFlowChartData(
        values: values,
        xLabels: [for (var i = 0; i < 5; i++) DateLabels.short(Calendar.addDays(today, (days * i / 4).round()))],
        gridValues: _grid(values),
        lowIndex: lowSample,
        lowLabel: 'Low ${Money.format(balances[lowDay], decimals: 0)}',
        endLabel: Money.format(projected, decimals: 0),
      ),
      breakdown: [
        BreakdownLine(
          title: 'Cash today',
          subtitle: cashAccounts.isEmpty ? 'No checking or savings linked' : cashAccounts.map((a) => a.name).join(', '),
          amount: cashToday,
        ),
        BreakdownLine(
          title: 'Expected income',
          subtitle: '${scenario.$1} · recurring deposits from your bank',
          amount: income,
          tone: AmountTone.positive,
        ),
        BreakdownLine(
          title: 'Bills & recurring',
          subtitle: '${events.where((e) => e.amount < 0).length} payments in the next $days days',
          amount: bills,
          tone: AmountTone.negative,
        ),
        BreakdownLine(
          title: 'Everyday spending',
          subtitle: 'Your 90-day average (${Money.format(perDay)} a day)',
          amount: perDay * days,
          tone: AmountTone.negative,
        ),
      ],
    );
  }

  /// Predicted dates of [s] within [from, until].
  static Iterable<DateTime> _occurrences(RecurringStream s, DateTime from, DateTime until) sync* {
    var date = s.nextDate;
    if (date == null) return;
    final step = PlaidBillService.periodDays(s.frequency);
    while (date!.isBefore(from)) {
      date = Calendar.addDays(date, step);
    }
    while (!date!.isAfter(until)) {
      yield date;
      date = Calendar.addDays(date, step);
    }
  }

  /// Three round gridline values spanning [values].
  static List<double> _grid(List<double> values) {
    if (values.isEmpty) return const [];
    final lo = values.reduce((a, b) => a < b ? a : b), hi = values.reduce((a, b) => a > b ? a : b);
    final span = (hi - lo).abs() < 1 ? 1000.0 : hi - lo;
    final step = _niceStep(span / 2);
    final base = (lo / step).floor() * step;
    return [base, base + step, base + 2 * step];
  }

  static double _niceStep(double raw) {
    var magnitude = 1.0;
    while (magnitude * 10 <= raw) {
      magnitude *= 10;
    }
    for (final m in [1, 2, 5, 10]) {
      if (raw <= m * magnitude) return m * magnitude;
    }
    return 10 * magnitude;
  }
}
