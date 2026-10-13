import 'package:flutter/material.dart'
    show
        BorderRadius,
        BoxDecoration,
        BuildContext,
        Column,
        Container,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        FontWeight,
        Icon,
        IconData,
        Icons,
        ListView,
        Row,
        SafeArea,
        Scaffold,
        SizedBox,
        StatelessWidget,
        Text,
        TextStyle,
        ValueChanged,
        VoidCallback,
        Widget;
import '../../models/recurring.dart' show BillDetailData, BillPayment;
import '../format.dart' show Fmt;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, HairLine, Heading, IconBadge, ListRow, PaceCard, PaceTopBar, PillButton, Tap;

/// One bill or subscription: what it costs, when it's next due, where it comes from, price changes,
/// its payments, and actions (mark paid, pause / resume, edit / delete for ones the user added).
class BillDetailScreen extends StatelessWidget {
  final BillDetailData data;
  final VoidCallback? onMarkPaid;
  final VoidCallback? onTogglePaused;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final ValueChanged<BillPayment>? onPaymentTap;
  final VoidCallback? onBack;

  const BillDetailScreen({
    super.key,
    required this.data,
    this.onMarkPaid,
    this.onTogglePaused,
    this.onEdit,
    this.onDelete,
    this.onPaymentTap,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final d = data;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar(d.kind.label, back: true, onBack: onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 8),
                  Row(children: [
                    IconBadge(AppIcons.of(d.iconKey), size: 56),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Heading(d.name, style: T.title),
                        const SizedBox(height: 2),
                        Text('${d.kind.label} · ${d.categoryName}', style: T.sub),
                      ]),
                    ),
                  ]),
                  const SizedBox(height: 18),
                  PaceCard(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(d.amountLabel, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Text(d.yearlyLabel, style: T.sub),
                      const SizedBox(height: 14),
                      _fact(d.isPaused ? Icons.pause_circle_outline : Icons.event_outlined, d.nextLabel),
                      const SizedBox(height: 8),
                      _fact(d.isManual ? Icons.edit_note : Icons.account_balance_outlined, d.sourceLabel),
                    ]),
                  ),
                  if (d.priceChangeLabel != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: C.redBg, borderRadius: BorderRadius.circular(12)),
                      child: Row(children: [
                        Icon(Icons.trending_up, color: C.red),
                        const SizedBox(width: 10),
                        Expanded(child: Text(d.priceChangeLabel!, style: TextStyle(fontSize: 15, color: C.red, fontWeight: FontWeight.w600))),
                      ]),
                    ),
                  ],
                  const SizedBox(height: 18),
                  if (d.canMarkPaid) ...[
                    PillButton('Mark next payment as paid', icon: Icons.check, onPressed: onMarkPaid),
                    const SizedBox(height: 12),
                  ],
                  PillButton(
                    d.isPaused ? 'Resume tracking' : 'Pause tracking',
                    icon: d.isPaused ? Icons.play_arrow : Icons.pause,
                    filled: false,
                    onPressed: onTogglePaused,
                  ),
                  if (d.isManual) ...[
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: PillButton('Edit', icon: Icons.edit_outlined, filled: false, onPressed: onEdit)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: PillButton('Delete', icon: Icons.delete_outline, filled: false, foreground: C.red, onPressed: onDelete),
                      ),
                    ]),
                  ],
                  const SizedBox(height: 24),
                  Heading('PAYMENTS', style: T.label),
                  const SizedBox(height: 8),
                  if (d.history.isEmpty)
                    Text(
                      d.isManual
                          ? 'Bills and subscriptions you add aren’t matched to bank transactions.'
                          : 'No payments found yet.',
                      style: T.body,
                    )
                  else
                    PaceCard(
                      padding: EdgeInsets.zero,
                      child: Column(children: [
                        for (var i = 0; i < d.history.length; i++) ...[
                          if (i > 0) const HairLine(),
                          Tap(
                            onTap: onPaymentTap == null ? null : () => onPaymentTap!(d.history[i]),
                            child: ListRow(
                              title: d.history[i].dateLabel,
                              trailing: Text(Fmt.signed(d.history[i].amount), style: T.amount),
                            ),
                          ),
                        ],
                      ]),
                    ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fact(IconData icon, String text) => Row(children: [
        Icon(icon, size: 18, color: C.muted),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(fontSize: 14, color: C.muted))),
      ]);
}
