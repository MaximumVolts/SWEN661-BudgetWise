import '../models/bank_data.dart' show BankSnapshot, BankTransaction;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/spending.dart' show BarDatum, SpendingCategory, SpendingData;
import 'bank_categories.dart' show BankCategories;
import 'calendar.dart' show Calendar;
import 'date_labels.dart' show DateLabels;
import 'spending_service.dart' show SpendingService;

/// [SpendingService] over the linked banks' transactions from Plaid (sandbox).
/// BUSINESS RULES: spending = everyday money out (see BankCategories.isSpending); periods are this
/// month / last 3 months / this year, compared with the period of the same length just before.
class PlaidSpendingService extends AnnotatedBankDataService implements SpendingService {
  static const _ranges = ['Month', '3 months', 'Year'];

  PlaidSpendingService(super.bankData, super.annotations, {super.now});

  @override
  Future<SpendingData> getSpending({required int rangeIndex}) async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final now = currentTime();
    final today = Calendar.dateOnly(now);
    final end = Calendar.addDays(today, 1); // exclusive
    final start = switch (rangeIndex) {
      1 => DateTime(now.year, now.month - 2, 1),
      2 => DateTime(now.year, 1, 1),
      _ => DateTime(now.year, now.month, 1),
    };
    final previousStart = Calendar.addDays(start, -Calendar.daysBetween(start, end));

    final current = spending(snap, overrides, start, end);
    final previous = spending(snap, overrides, previousStart, start);
    final total = _sum(current);
    final previousTotal = _sum(previous);

    // Bars: weeks of this month, or months of the longer ranges.
    final bars = <BarDatum>[];
    if (rangeIndex == 0) {
      for (var weekStart = start; weekStart.isBefore(end); weekStart = Calendar.addDays(weekStart, 7)) {
        final weekEnd = Calendar.addDays(weekStart, 7);
        bars.add(BarDatum(
          label: '${weekStart.day}',
          value: _sum(current.where((t) => !t.date.isBefore(weekStart) && t.date.isBefore(weekEnd))),
          semanticLabel: 'Week of ${DateLabels.short(weekStart)}',
        ));
      }
    } else {
      for (var m = start; m.isBefore(end); m = DateTime(m.year, m.month + 1, 1)) {
        final next = DateTime(m.year, m.month + 1, 1);
        bars.add(BarDatum(
          label: DateLabels.monthAbbr(m.month),
          value: _sum(current.where((t) => !t.date.isBefore(m) && t.date.isBefore(next))),
          semanticLabel: DateLabels.monthName(m.month),
        ));
      }
    }

    final byCategory = <String, double>{}, previousByCategory = <String, double>{};
    for (final t in current) {
      final id = BankCategories.of(t, overrides).id;
      byCategory[id] = (byCategory[id] ?? 0) + t.amount;
    }
    for (final t in previous) {
      final id = BankCategories.of(t, overrides).id;
      previousByCategory[id] = (previousByCategory[id] ?? 0) + t.amount;
    }
    final top = byCategory.values.fold(0.0, (a, b) => a > b ? a : b);
    final categories = [
      for (final e in byCategory.entries)
        SpendingCategory(
          id: e.key,
          name: BankCategories.byId(e.key).name,
          iconKey: BankCategories.byId(e.key).iconKey,
          amount: e.value,
          share: top <= 0 ? 0 : e.value / top,
          changePercent: percentChange(previousByCategory[e.key], e.value),
        ),
    ]..sort((a, b) => b.amount.compareTo(a.amount));

    final lastWithData = bars.lastIndexWhere((b) => b.value > 0);
    return SpendingData(
      rangeLabels: _ranges,
      selectedRange: rangeIndex.clamp(0, 2),
      periodTitle: switch (rangeIndex) {
        1 => '${DateLabels.monthAbbr(start.month)}–${DateLabels.monthAbbr(now.month)} spending',
        2 => '${now.year} spending',
        _ => '${DateLabels.monthName(now.month)} spending',
      },
      total: total,
      changePercent: percentChange(previousTotal, total),
      bars: bars,
      highlightedBar: lastWithData < 0 ? null : lastWithData,
      categories: categories,
    );
  }

  /// Everyday spending transactions dated in [start, end).
  static List<BankTransaction> spending(BankSnapshot snap, Map<String, List<String>> overrides, DateTime start, DateTime end) => [
        for (final t in snap.transactions)
          if (BankCategories.isSpending(t, overrides) && !t.date.isBefore(start) && t.date.isBefore(end)) t,
      ];

  static double _sum(Iterable<BankTransaction> ts) => ts.fold(0.0, (s, t) => s + t.amount);

  /// % change from [before] to [after]; null when there's nothing to compare with.
  static double? percentChange(double? before, double after) =>
      before == null || before <= 0 ? null : (after - before) / before * 100;
}
