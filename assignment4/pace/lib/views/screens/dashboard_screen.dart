import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BoxShape, Builder, BuildContext, Center, Clip, Color, Colors, Column, Container,
        CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, ListView, MainAxisAlignment, MainAxisSize, Padding, Positioned,
        Row, SafeArea, Scaffold, SizedBox, Spacer, Stack, StatelessWidget, Text, TextStyle, ValueChanged, VoidCallback,
        Widget;
import '../widgets/charts.dart' show SpendAreaChart;
import '../widgets/display_options.dart' show PaceDisplay;
import '../widgets/status_mark.dart' show BudgetStatusLook, BudgetStatusMark;
import '../format.dart' show Fmt;
import '../../models/bill.dart' show BillItem;
import '../../models/budget.dart' show BudgetCategory, BudgetStatus, BudgetSummary;
import '../../models/dashboard.dart' show AccountTone, DashboardAccount, DashboardData, ToolLink;
import '../../models/transaction.dart' show TransactionItem;
import '../../models/trend.dart' show TrendDirection, TrendItem;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart'
    show AppIcons, HairLine, IconBadge, ListRow, PaceCard, PaceNavBar, SectionHeader, StripedBar, Tap;

/// 05 - Dashboard (Home)
class DashboardScreen extends StatelessWidget {
  final DashboardData data;

  final VoidCallback? onSettings;
  final VoidCallback? onNotifications;
  final VoidCallback? onReviewTransactions;
  final VoidCallback? onPaydayInfo;
  final VoidCallback? onAddAccount;
  final ValueChanged<DashboardAccount>? onAccountTap;
  final VoidCallback? onSyncNow;
  final ValueChanged<TransactionItem>? onTransactionTap;
  final VoidCallback? onSeeMoreTransactions;
  final VoidCallback? onSeeBudget;
  final ValueChanged<BudgetCategory>? onBudgetCategoryTap;
  final VoidCallback? onSeeAllBills;
  final ValueChanged<BillItem>? onBillTap;
  final VoidCallback? onSeeAllTrends;
  final ValueChanged<TrendItem>? onTrendAction;
  final ValueChanged<ToolLink>? onToolTap;
  final ValueChanged<int>? onNavTap;

  const DashboardScreen({
    super.key,
    required this.data,
    this.onSettings,
    this.onNotifications,
    this.onReviewTransactions,
    this.onPaydayInfo,
    this.onAddAccount,
    this.onAccountTap,
    this.onSyncNow,
    this.onTransactionTap,
    this.onSeeMoreTransactions,
    this.onSeeBudget,
    this.onBudgetCategoryTap,
    this.onSeeAllBills,
    this.onBillTap,
    this.onSeeAllTrends,
    this.onTrendAction,
    this.onToolTap,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
    final spend = data.spend;
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 0, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
              child: Row(
                children: [
                  Tap(onTap: onSettings, semanticLabel: 'Settings', child: const Icon(Icons.settings_outlined)),
                  const Spacer(),
                  Text(data.dateLabel, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                  const Spacer(),
                  Tap(
                    onTap: onNotifications,
                    semanticLabel: data.hasUnreadNotifications ? 'Notifications, you have unread notifications' : 'Notifications',
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(Icons.notifications_none, size: 28),
                        if (data.hasUnreadNotifications)
                          Positioned(
                            right: 2,
                            top: 0,
                            child: Container(width: 8, height: 8, decoration: BoxDecoration(color: C.red, shape: BoxShape.circle)),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (data.reviewBanner != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
                child: Tap(
                  onTap: onReviewTransactions,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      children: [
                        const Icon(Icons.receipt_long_outlined, size: 24),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(data.reviewBanner!.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                              Text(data.reviewBanner!.subtitle, style: const TextStyle(fontSize: 12.5)),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ),
                ),
              ),
            // Spend card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: PaceCard(
                radius: 20,
                padding: const EdgeInsets.fromLTRB(20, 20, 0, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: Text(spend.title, style: TextStyle(fontSize: 14, color: C.muted))),
                          if (spend.deltaAmount != null) ...[
                            Icon(spend.deltaIsAbove ? Icons.arrow_upward : Icons.arrow_downward,
                                size: 15, color: spend.deltaIsAbove ? C.red : C.olive),
                            Text(' ${Fmt.money(spend.deltaAmount!)} ${spend.deltaIsAbove ? 'above' : 'below'}',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: spend.deltaIsAbove ? C.red : C.olive)),
                          ],
                          if (spend.deltaPeriodLabel != null)
                            Text('  ${spend.deltaPeriodLabel}', style: TextStyle(fontSize: 12, color: C.muted)),
                        ],
                      ),
                    ),
                    Text(Fmt.money(spend.amount, decimals: 0), style: T.big),
                    SpendAreaChart(data: spend.chart),
                    if (spend.currentLegend.isNotEmpty)
                      Row(
                        children: [
                          _LegendKey(C.ink),
                          const SizedBox(width: 6),
                          Text(spend.currentLegend, style: TextStyle(fontSize: 12, color: C.muted)),
                          if (spend.previousLegend != null) ...[
                            const SizedBox(width: 14),
                            _LegendKey(C.previous, dotted: true),
                            const SizedBox(width: 6),
                            Text(spend.previousLegend!, style: TextStyle(fontSize: 12, color: C.muted)),
                          ],
                        ],
                      ),
                  ],
                ),
              ),
            ),
            if (data.paydayLabel != null) ...[
              const SizedBox(height: 14),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    children: [
                      Icon(Icons.account_balance_wallet_outlined, size: 20, color: C.olive),
                      const SizedBox(width: 12),
                      Text(data.paydayLabel!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      Tap(onTap: onPaydayInfo, semanticLabel: 'About payday estimate', child: const Icon(Icons.info_outline, size: 20)),
                    ],
                  ),
                ),
              ),
            ],

            // Accounts
            if (data.accounts.isNotEmpty) ...[
              SectionHeader('ACCOUNTS', action: 'Add account', big: true, onAction: onAddAccount),
              const HairLine(),
              for (final a in data.accounts) ...[
                Tap(onTap: onAccountTap == null ? null : () => onAccountTap!(a), child: _acct(a)),
                const HairLine(),
              ],
              if (data.lastSyncLabel != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.sync, size: 16),
                      const SizedBox(width: 6),
                      Text('${data.lastSyncLabel}  ', style: TextStyle(fontSize: 12, color: C.muted)),
                      Tap(onTap: onSyncNow, child: Text('Sync now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: C.olive))),
                    ],
                  ),
                ),
            ],

            // Recent transactions
            if (data.recentTransactions.isNotEmpty) ...[
              const SectionHeader('RECENT TRANSACTIONS', big: true),
              const HairLine(),
              for (final t in data.recentTransactions) ...[
                Tap(onTap: onTransactionTap == null ? null : () => onTransactionTap!(t), child: _txn(t)),
                const HairLine(),
              ],
              const SizedBox(height: 14),
              Center(
                child: Tap(
                  onTap: onSeeMoreTransactions,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: C.outline)),
                    child: const Text('See more', style: TextStyle(fontWeight: FontWeight.w500)),
                  ),
                ),
              ),
              const SizedBox(height: 28),
            ],

            // Budget
            if (data.budget != null) ...[
              SectionHeader('YOUR BUDGET', action: 'See budget', big: true, onAction: onSeeBudget),
              _budgetHeader(data.budget!),
              const SizedBox(height: 12),
              const HairLine(),
              for (final c in data.budgetCategories) ...[
                Tap(onTap: onBudgetCategoryTap == null ? null : () => onBudgetCategoryTap!(c), child: _budgetRow(c)),
                const HairLine(),
              ],
              const SizedBox(height: 32),
            ],

            // Bills
            if (data.upcomingBills.isNotEmpty) ...[
              SectionHeader('UPCOMING BILLS', action: 'See all bills', big: true, onAction: onSeeAllBills),
              for (final b in data.upcomingBills) ...[
                Tap(onTap: onBillTap == null ? null : () => onBillTap!(b), child: _bill(b)),
                const HairLine(),
              ],
              const SizedBox(height: 28),
            ],

            // Trends
            if (data.featuredTrend != null) ...[
              SectionHeader('TRENDS FOR YOU', action: 'See all trends', big: true, onAction: onSeeAllTrends),
              const HairLine(),
              _trend(data.featuredTrend!),
              const HairLine(),
            ],

            // More tools
            if (data.tools.isNotEmpty) ...[
              const SectionHeader('MORE TOOLS', big: true),
              const HairLine(),
              for (final t in data.tools) ...[
                Tap(onTap: onToolTap == null ? null : () => onToolTap!(t), child: _tool(t)),
                const HairLine(),
              ],
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _acct(DashboardAccount a) {
    final red = a.tone == AccountTone.alert;
    return ListRow(
      leading: IconBadge(AppIcons.of(a.iconKey),
          bg: red ? C.redBg : (a.tone == AccountTone.accent ? C.lime : C.chip), fg: red ? C.red : C.ink, size: 38, square: true),
      title: a.name,
      titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      subtitle: a.subtitle == null ? null : Text(a.subtitle!, style: TextStyle(fontSize: 12, color: red ? C.red : C.muted)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(Fmt.money(a.balance), style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: red ? C.red : C.ink)),
          if (a.hasInfo) ...[const SizedBox(width: 6), const Icon(Icons.info_outline, size: 18)],
          const SizedBox(width: 10),
          const Icon(Icons.keyboard_arrow_down),
        ],
      ),
    );
  }

  Widget _txn(TransactionItem t) {
    final income = t.amount > 0;
    return ListRow(
      leading: IconBadge(AppIcons.of(t.iconKey), bg: t.highlight ? C.lime : C.chip, size: 38),
      title: t.title,
      titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      subtitle: Text(t.subtitle, style: TextStyle(fontSize: 12, color: C.muted)),
      trailing: Text(income ? Fmt.signed(t.amount) : Fmt.money(t.amount.abs()),
          style: TextStyle(fontSize: 15, fontWeight: income ? FontWeight.w700 : FontWeight.w400, color: income ? C.olive : C.ink)),
    );
  }

  Widget _budgetHeader(BudgetSummary b) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(b.periodLabel, style: TextStyle(fontSize: 12, color: C.muted)),
              const Spacer(),
              Text('${Fmt.money(b.spent)} of ${Fmt.money(b.limit, decimals: 0)}', style: TextStyle(fontSize: 12, color: C.muted)),
            ],
          ),
          const SizedBox(height: 4),
          Text(b.remaining >= 0 ? '${Fmt.money(b.remaining)} left to spend' : '${Fmt.money(-b.remaining)} over budget',
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w500)),
          const SizedBox(height: 10),
          StripedBar(value: b.progress, semanticLabel: '${b.periodLabel} budget used'),
          if (b.statusLabel != null) ...[
            const SizedBox(height: 8),
            Row(children: [
              _Dot(C.ink),
              const SizedBox(width: 6),
              Text(b.statusLabel!, style: TextStyle(fontSize: 12, color: C.muted)),
            ]),
          ],
        ],
      ),
    );
  }

  Widget _budgetRow(BudgetCategory c) {
    final over = c.status == BudgetStatus.over;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconBadge(over ? Icons.cancel_outlined : AppIcons.of(c.iconKey), bg: over ? C.redBg : C.chip, fg: over ? C.red : C.ink, size: 38, square: true),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(c.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                    const Spacer(),
                    Text(over ? '${Fmt.money(-c.remaining)} over' : '${Fmt.money(c.remaining)} left',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: over ? C.red : C.ink)),
                  ],
                ),
                const SizedBox(height: 6),
                // Colorblind mode: near / over are also striped.
                Builder(
                  builder: (context) => StripedBar(
                      value: c.progress,
                      color: over ? C.red : C.ink,
                      height: 5,
                      striped: c.status != BudgetStatus.onTrack && PaceDisplay.colorblindOf(context),
                      semanticLabel: '${c.name} budget used'),
                ),
                const SizedBox(height: 6),
                Row(children: [
                  BudgetStatusMark(c.status, color: c.status.color, size: 14),
                  const SizedBox(width: 6),
                  Text(c.status.label, style: TextStyle(fontSize: 11, color: c.status.color)),
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bill(BillItem b) {
    return ListRow(
      leading: IconBadge(AppIcons.of(b.iconKey), bg: b.isOverdue ? C.redBg : C.chip, fg: b.isOverdue ? C.red : C.ink, size: 38, square: true),
      title: b.title,
      titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      subtitle: Text(b.subtitle, style: TextStyle(fontSize: 12, color: b.isOverdue ? C.red : C.muted)),
      trailing: Text(Fmt.money(b.amount), style: const TextStyle(fontSize: 15)),
    );
  }

  Widget _trend(TrendItem t) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(12)),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(t.direction == TrendDirection.falling ? Icons.trending_down : Icons.trending_up, size: 16),
                const SizedBox(width: 4),
                Text(t.directionLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(t.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
          const SizedBox(height: 12),
          Text(t.body, style: TextStyle(fontSize: 16, color: C.muted, height: 1.35)),
          const SizedBox(height: 14),
          Tap(
            onTap: onTrendAction == null ? null : () => onTrendAction!(t),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: C.outline)),
              child: Text(t.actionLabel, style: const TextStyle(fontWeight: FontWeight.w500)),
            ),
          ),
          if (data.featuredTrendSource != null) ...[
            const SizedBox(height: 14),
            Row(children: [
              const Icon(Icons.person_outline, size: 14),
              const SizedBox(width: 6),
              Text(data.featuredTrendSource!, style: TextStyle(fontSize: 12, color: C.muted)),
            ]),
          ],
        ],
      ),
    );
  }

  Widget _tool(ToolLink t) {
    return ListRow(
      leading: IconBadge(AppIcons.of(t.iconKey), bg: t.accent ? C.lime : C.chip, size: 38, square: true),
      title: t.title,
      titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      subtitle: Text(t.subtitle, style: TextStyle(fontSize: 12, color: C.muted)),
      trailing: const Icon(Icons.chevron_right),
    );
  }
}

/// Chart legend key. In colorblind mode it's a sample of the line's style
/// (solid or dotted, as drawn in the chart); otherwise a colored dot.
class _LegendKey extends StatelessWidget {
  final Color color;
  final bool dotted;
  const _LegendKey(this.color, {this.dotted = false});

  @override
  Widget build(BuildContext context) {
    if (!PaceDisplay.colorblindOf(context)) return _Dot(color);
    Widget seg(double w) => Container(width: w, height: 3, color: color);
    return SizedBox(
      width: 16,
      child: dotted
          ? Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [seg(3), seg(3), seg(3)])
          : seg(16),
    );
  }
}

class _Dot extends StatelessWidget {
  final Color color;
  const _Dot(this.color);
  @override
  Widget build(BuildContext context) =>
      Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle));
}
