import 'package:flutter/material.dart'
    show Axis, BorderRadius, BorderSide, BoxDecoration, BoxShape, BuildContext, Center, Color, Colors, Column,
        Container, CrossAxisAlignment, EdgeInsets, ElevatedButton, Expanded, Flexible, FontWeight, Icon, IconData,
        Icons, ListView, MainAxisSize, OutlinedButton, Padding, Positioned, Radius, Row, SafeArea, Scaffold,
        SingleChildScrollView, SizedBox, Spacer, Stack, StadiumBorder, StatelessWidget, Text, TextDecoration, TextStyle,
        ValueChanged, VoidCallback, Widget;
import '../../models/notification.dart' show NotificationItem, NotificationKind, NotificationsData;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show HairLine, Heading, IconBadge, PaceChip, PressFeedback, StripedBar, Tap;

/// 14 - Notifications (bottom-sheet style)
class NotificationsScreen extends StatelessWidget {
  final NotificationsData data;
  final VoidCallback? onClose;
  final VoidCallback? onMarkAllRead;
  final ValueChanged<int>? onFilterChanged;
  final ValueChanged<NotificationItem>? onItemTap;
  final ValueChanged<NotificationItem>? onPrimaryAction;
  final ValueChanged<NotificationItem>? onSecondaryAction;
  final String emptyMessage;

  const NotificationsScreen({
    super.key,
    required this.data,
    this.onClose,
    this.onMarkAllRead,
    this.onFilterChanged,
    this.onItemTap,
    this.onPrimaryAction,
    this.onSecondaryAction,
    this.emptyMessage = "You're all caught up.",
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.chip,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 90),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(color: C.bg, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
                child: Stack(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            margin: const EdgeInsets.only(top: 12),
                            width: 32,
                            height: 4,
                            decoration: BoxDecoration(color: C.line, borderRadius: BorderRadius.circular(2)),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(24, 20, 20, 16),
                          child: Row(
                            children: [
                              const Heading('Notifications', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                              const Spacer(),
                              Tap(onTap: onMarkAllRead, child: const Text('Mark all read', style: T.link)),
                              const SizedBox(width: 16),
                              Tap(onTap: onClose, semanticLabel: 'Close notifications', child: const Icon(Icons.cancel_outlined, size: 26)),
                            ],
                          ),
                        ),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            children: [
                              for (var i = 0; i < data.filterLabels.length; i++) ...[
                                if (i > 0) const SizedBox(width: 10),
                                Tap(
                                  onTap: onFilterChanged == null ? null : () => onFilterChanged!(i),
                                  child: PaceChip(
                                    data.filterLabels[i],
                                    selected: i == data.selectedFilter,
                                    showCheck: true,
                                    selectedBg: C.ink,
                                    selectedFg: Colors.white,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        const HairLine(),
                        Expanded(
                          child: data.items.isEmpty
                              ? Center(child: Text(emptyMessage, style: T.body))
                              : ListView(
                                  padding: EdgeInsets.only(bottom: data.sync != null ? 90 : 16),
                                  children: [
                                    for (final n in data.items) ...[
                                      Tap(onTap: onItemTap == null ? null : () => onItemTap!(n), child: _item(n)),
                                      const HairLine(),
                                    ],
                                  ],
                                ),
                        ),
                      ],
                    ),
                    if (data.sync != null)
                      Positioned(
                        left: 24,
                        right: 24,
                        bottom: 16,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                          decoration: BoxDecoration(color: C.ink, borderRadius: BorderRadius.circular(8)),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(children: [
                                const Icon(Icons.sync, color: C.lime, size: 22),
                                const SizedBox(width: 12),
                                Text(data.sync!.label, style: const TextStyle(color: Colors.white, fontSize: 15)),
                              ]),
                              const SizedBox(height: 8),
                              StripedBar(value: data.sync!.progress, color: C.lime, track: const Color(0xFF444444), height: 3, semanticLabel: data.sync!.label),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _item(NotificationItem n) {
    final (IconData icon, Color bg, Color fg, bool underline) = switch (n.kind) {
      NotificationKind.overdue => (Icons.error_outline, C.redBg, C.red, false),
      NotificationKind.overBudget => (Icons.error_outline, C.redBg, C.red, true),
      NotificationKind.nearLimit => (Icons.warning_amber_rounded, C.lime, C.ink, true),
      NotificationKind.reminder => (Icons.notifications_none, C.chip, C.ink, false),
    };
    final hasActions = n.primaryActionLabel != null || n.secondaryActionLabel != null;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconBadge(icon, bg: bg, fg: fg, size: 44),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  if (n.isNew) ...[
                    Container(width: 8, height: 8, decoration: const BoxDecoration(color: C.ink, shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                  ],
                  Flexible(child: Text('${n.isNew ? 'New · ' : ''}${n.metaLabel}', style: const TextStyle(fontSize: 12, color: C.muted))),
                ]),
                const SizedBox(height: 4),
                Text(n.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: n.isNew ? FontWeight.w700 : FontWeight.w400,
                      decoration: underline ? TextDecoration.underline : null,
                    )),
                const SizedBox(height: 2),
                Text(n.body, style: const TextStyle(fontSize: 14, color: C.muted)),
                if (hasActions) ...[
                  const SizedBox(height: 12),
                  Row(children: [
                    if (n.primaryActionLabel != null)
                      PressFeedback(
                        enabled: true,
                        showOverlay: false,
                        child: ElevatedButton(
                          onPressed: onPrimaryAction == null ? () {} : () => onPrimaryAction!(n),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: C.ink,
                              foregroundColor: Colors.white,
                              shape: const StadiumBorder(),
                              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12)),
                          child: Text(n.primaryActionLabel!, style: const TextStyle(fontWeight: FontWeight.w600)),
                        ),
                      ),
                    if (n.primaryActionLabel != null && n.secondaryActionLabel != null) const SizedBox(width: 10),
                    if (n.secondaryActionLabel != null)
                      PressFeedback(
                        enabled: true,
                        showOverlay: false,
                        child: OutlinedButton(
                          onPressed: onSecondaryAction == null ? () {} : () => onSecondaryAction!(n),
                          style: OutlinedButton.styleFrom(
                              foregroundColor: C.ink,
                              side: const BorderSide(color: C.outline),
                              shape: const StadiumBorder(),
                              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12)),
                          child: Text(n.secondaryActionLabel!, style: const TextStyle(fontWeight: FontWeight.w600)),
                        ),
                      ),
                  ]),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
