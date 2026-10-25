import 'package:flutter/material.dart'
    show Alignment, BorderRadius, BoxDecoration, BoxShape, BuildContext, Center, Colors, Column, Container,
        CrossAxisAlignment, EdgeInsets, Expanded, Flexible, FontWeight, Icon, IconData, Icons, ListView,
        MainAxisAlignment, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Switch, Text,
        TextDecoration, TextStyle, ValueChanged, VoidCallback, Widget, WidgetStateProperty;
import '../../models/settings.dart' show SettingsData;
import '../theme.dart' show C;
import '../widgets/colorblind_preview.dart' show ColorblindPreview;
import '../widgets/widgets.dart' show HairLine, Heading, IconBadge, PaceCard, Tap;

/// 15 - Settings. Toggles are *controlled*: the values come from [data] and changes are
/// reported through callbacks, so your state layer stays the source of truth.
class SettingsScreen extends StatelessWidget {
  final SettingsData data;
  final VoidCallback? onClose;
  final VoidCallback? onProfile;
  final VoidCallback? onConnectedAccounts;
  final VoidCallback? onBudgetCategories;
  final VoidCallback? onStatementExport;
  final VoidCallback? onTheme;
  final ValueChanged<bool>? onHighContrastChanged;
  final ValueChanged<bool>? onColorblindModeChanged;
  final ValueChanged<bool>? onShowChartValuesChanged;
  final VoidCallback? onBillReminders;
  /// Sends a sample bill reminder notification now.
  final VoidCallback? onTestReminder;
  final ValueChanged<bool>? onBudgetAlertsChanged;
  final VoidCallback? onSignOut;
  final VoidCallback? onDeleteAccount;

  const SettingsScreen({
    super.key,
    required this.data,
    this.onClose,
    this.onProfile,
    this.onConnectedAccounts,
    this.onBudgetCategories,
    this.onStatementExport,
    this.onTheme,
    this.onHighContrastChanged,
    this.onColorblindModeChanged,
    this.onShowChartValuesChanged,
    this.onBillReminders,
    this.onTestReminder,
    this.onBudgetAlertsChanged,
    this.onSignOut,
    this.onDeleteAccount,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 14),
            Row(
              children: [
                const Spacer(),
                const SizedBox(width: 26),
                const Heading('Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onClose, semanticLabel: 'Close settings', child: const Icon(Icons.cancel_outlined, size: 48)),
              ],
            ),
            const SizedBox(height: 16),
            Tap(
              onTap: onProfile,
              child: PaceCard(
                radius: 14,
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(color: C.ink, shape: BoxShape.circle),
                      child: Text(data.initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(data.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          Text(data.username, style: TextStyle(fontSize: 13, color: C.muted)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right),
                  ],
                ),
              ),
            ),
            _group('Accounts & data', [
              _row(Icons.person_outline, 'Connected accounts',
                  sub: data.accountsNeedingAttention > 0 ? '${data.accountsNeedingAttention} needs attention' : null,
                  subRed: true,
                  value: '${data.connectedAccountCount}',
                  chevron: true,
                  onTap: onConnectedAccounts),
              _row(Icons.person_outline, 'Budget categories', chevron: true, onTap: onBudgetCategories),
              _row(Icons.file_download_outlined, 'Statement export', sub: 'PDF or CSV', chevron: true, onTap: onStatementExport),
            ]),
            _group('Accessibility & display', [
              _row(Icons.contrast, 'Theme', value: data.themeLabel, chevron: true, onTap: onTheme),
              _row(Icons.wb_sunny_outlined, 'High contrast', toggle: data.highContrast, onToggle: onHighContrastChanged),
              Column(children: [
                _row(Icons.visibility_outlined, 'Colorblind mode',
                    sub: 'Colorblind-safe colors, with shapes and patterns for status',
                    toggle: data.colorblindMode,
                    onToggle: onColorblindModeChanged),
                const ColorblindPreview(), // shows the effect right here when the switch flips
              ]),
              _row(Icons.bar_chart, 'Show values on charts', toggle: data.showChartValues, onToggle: onShowChartValuesChanged),
            ]),
            _group('Notifications', [
              _row(Icons.notifications_none, 'Bill reminders', value: data.billReminderLabel, chevron: true, onTap: onBillReminders),
              _row(Icons.notifications_active_outlined, 'Send a test reminder',
                  sub: 'Shows a bill reminder notification now', chevron: true, onTap: onTestReminder),
              _row(Icons.alarm, 'Budget alerts', toggle: data.budgetAlerts, onToggle: onBudgetAlertsChanged),
            ]),
            _group('Account', [
              _row(Icons.logout, 'Sign out', red: true, onTap: onSignOut),
            ]),
            const SizedBox(height: 18),
            Center(
              child: Tap(
                onTap: onDeleteAccount,
                child: Text('Delete account', style: TextStyle(color: C.red, fontSize: 36, decoration: TextDecoration.underline)),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.bolt, size: 20),
                ),
                const SizedBox(width: 8),
                const Text('Pace', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              ],
            ),
            if (data.footerLabel.isNotEmpty) ...[
              const SizedBox(height: 4),
              Center(child: Text(data.footerLabel, style: TextStyle(fontSize: 11, letterSpacing: 1, color: C.muted))),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _group(String title, List<Widget> rows) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 18, bottom: 8),
          child: Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: C.muted)),
        ),
        PaceCard(
          radius: 14,
          padding: EdgeInsets.zero,
          child: Column(children: [
            for (var i = 0; i < rows.length; i++) ...[if (i > 0) const HairLine(), rows[i]],
          ]),
        ),
      ],
    );
  }

  Widget _row(
    IconData icon,
    String title, {
    String? sub,
    bool subRed = false,
    String? value,
    bool chevron = false,
    bool red = false,
    bool? toggle,
    ValueChanged<bool>? onToggle,
    VoidCallback? onTap,
  }) {
    return Tap(
      onTap: onTap,
      isButton: toggle == null && onTap != null,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            IconBadge(icon, bg: red ? C.redBg : C.chip, fg: red ? C.red : C.ink, size: 38, square: true),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 16, color: red ? C.red : C.ink, fontWeight: red ? FontWeight.w500 : FontWeight.w400)),
                  if (sub != null)
                    Row(children: [
                      if (subRed) ...[
                        Container(width: 6, height: 6, decoration: BoxDecoration(color: C.red, shape: BoxShape.circle)),
                        const SizedBox(width: 4),
                      ],
                      Flexible(child: Text(sub, style: TextStyle(fontSize: 12, color: subRed ? C.red : C.muted))),
                    ]),
                ],
              ),
            ),
            if (value != null && value.isNotEmpty) ...[Text(value, style: TextStyle(fontSize: 14, color: C.muted)), const SizedBox(width: 6)],
            if (chevron) const Icon(Icons.chevron_right),
            if (toggle != null)
              Switch(
                value: toggle,
                onChanged: onToggle,
                activeThumbColor: Colors.white,
                activeTrackColor: C.ink,
                inactiveThumbColor: Colors.white,
                inactiveTrackColor: C.outline,
                trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
              ),
          ],
        ),
      ),
    );
  }
}
