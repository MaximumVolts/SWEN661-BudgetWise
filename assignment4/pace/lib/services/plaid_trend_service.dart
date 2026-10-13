import '../models/trend.dart' show TrendDirection, TrendItem, TrendsData;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import 'bank_categories.dart' show BankCategories;
import 'date_labels.dart' show DateLabels;
import '../models/money.dart' show Money;
import 'plaid_spending_service.dart' show PlaidSpendingService;
import 'trend_service.dart' show TrendService;

/// [TrendService] spotting patterns in the linked banks' transactions from Plaid (sandbox).
/// BUSINESS RULES: a category is rising / falling when this month so far is 20%+ above / below the
/// same days of last month (and at least $10 apart); recurring income streams are "steady".
class PlaidTrendService extends AnnotatedBankDataService implements TrendService {
  static const _threshold = 0.2;
  static const _minDifference = 10.0;

  PlaidTrendService(super.bankData, super.annotations, {super.now});

  @override
  Future<TrendsData> getTrends() async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final now = currentTime();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month, now.day + 1);
    final lastStart = DateTime(now.year, now.month - 1, 1);
    final lastEnd = DateTime(now.year, now.month - 1, now.day + 1);
    final thisMonth = DateLabels.monthName(now.month), lastMonth = DateLabels.monthName(lastStart.month);

    Map<String, double> byCategory(DateTime from, DateTime to) {
      final out = <String, double>{};
      for (final t in PlaidSpendingService.spending(snap, overrides, from, to)) {
        final id = BankCategories.of(t, overrides).id;
        out[id] = (out[id] ?? 0) + t.amount;
      }
      return out;
    }

    final current = byCategory(start, end), previous = byCategory(lastStart, lastEnd);
    final trends = <TrendItem>[];
    for (final id in {...current.keys, ...previous.keys}) {
      final now$ = current[id] ?? 0, before = previous[id] ?? 0;
      if ((now$ - before).abs() < _minDifference) continue;
      final name = BankCategories.byId(id).name;
      final lower = name.toLowerCase();
      if (before > 0 && now$ >= before * (1 + _threshold) || before == 0 && now$ > 0) {
        trends.add(TrendItem(
          id: id,
          direction: TrendDirection.rising,
          title: '$name spending is going up',
          body: "You've spent ${Money.format(now$)} on $lower so far in $thisMonth, up from "
              '${Money.format(before)} over the same days in $lastMonth.',
          actionLabel: 'View transactions',
        ));
      } else if (now$ <= before * (1 - _threshold)) {
        trends.add(TrendItem(
          id: id,
          direction: TrendDirection.falling,
          title: '$name spending went down',
          body: "You've spent ${Money.format(now$)} on $lower so far in $thisMonth, down from "
              '${Money.format(before)} over the same days in $lastMonth.',
          actionLabel: 'View transactions',
        ));
      }
    }
    trends.sort((a, b) => (current[b.id] ?? 0).compareTo(current[a.id] ?? 0));
    for (final s in snap.recurring.where((s) => s.isInflow && s.isActive)) {
      trends.add(TrendItem(
        id: 'income-${s.streamId}',
        direction: TrendDirection.steady,
        title: '${s.displayName} is steady',
        body: 'About ${Money.format(s.averageAmount)} arrives regularly'
            '${s.lastDate == null ? '' : ', most recently on ${DateLabels.short(s.lastDate!)}'}.',
        actionLabel: 'View deposits',
      ));
    }

    return TrendsData(
      headline: !snap.isLinked
          ? 'Connect a bank to see trends'
          : trends.isEmpty
              ? 'No new trends in your accounts'
              : '${trends.length} trend${trends.length == 1 ? '' : 's'} in your accounts',
      trends: trends,
      aboutText: "Trends compare this month so far with the same days last month, using your linked bank's "
          'transactions (Plaid Sandbox test data).',
    );
  }
}
