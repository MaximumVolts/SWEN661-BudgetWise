import 'package:flutter/material.dart'
    show BorderRadius, BoxDecoration, BuildContext, Colors, Column, Container, CrossAxisAlignment, EdgeInsets,
        ElevatedButton, Expanded, FontWeight, Icon, Icons, MainAxisAlignment, Padding, Row, SafeArea, Scaffold,
        SingleChildScrollView, SizedBox, Spacer, StadiumBorder, StatelessWidget, Text, TextStyle, ValueChanged,
        VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/account.dart' show AccountGroup, LinkedAccount, ReconnectBanner;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, HairLine, Heading, IconBadge, PaceCard, PillButton, PressFeedback, Tap;

/// 04 - Accounts
class AccountsScreen extends StatelessWidget {
  final ReconnectBanner? banner;
  final List<AccountGroup> groups;
  final VoidCallback? onReconnect;
  final VoidCallback? onDismissBanner;
  final VoidCallback? onLinkAccount;
  final VoidCallback? onMenu;
  final ValueChanged<LinkedAccount>? onAccountTap;
  /// Shown instead of the list when [groups] is empty.
  final String? emptyMessage;

  const AccountsScreen({
    super.key,
    required this.groups,
    this.banner,
    this.onReconnect,
    this.onDismissBanner,
    this.onLinkAccount,
    this.onMenu,
    this.onAccountTap,
    this.emptyMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Row(
                children: [
                  const Heading('Accounts', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                  const Spacer(),
                  Tap(onTap: onMenu, semanticLabel: 'Account options', child: const Icon(Icons.more_vert)),
                ],
              ),
              const SizedBox(height: 24),
              if (banner != null) ...[_banner(banner!), const SizedBox(height: 24)],
              if (groups.isEmpty && emptyMessage != null) ...[
                PaceCard(child: Text(emptyMessage!, style: T.body)),
                const SizedBox(height: 24),
              ],
              for (final g in groups) ...[
                Row(
                  children: [
                    Text(g.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    const Spacer(),
                    Text(g.institution, style: TextStyle(fontSize: 15, color: C.muted)),
                  ],
                ),
                const SizedBox(height: 12),
                PaceCard(
                  radius: 20,
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      for (var i = 0; i < g.accounts.length; i++) ...[
                        if (i > 0) const HairLine(),
                        Tap(onTap: onAccountTap == null ? null : () => onAccountTap!(g.accounts[i]), child: _AccountRow(g.accounts[i])),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
              PillButton('Link another account', icon: Icons.add, filled: false, height: 52, onPressed: onLinkAccount),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _banner(ReconnectBanner b) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: C.redBg, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.event_repeat_outlined, color: C.red, size: 26),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    Text(b.message, style: TextStyle(fontSize: 17, color: C.muted, height: 1.3)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Tap(onTap: onDismissBanner, child: const Text('Not now', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16))),
              const SizedBox(width: 28),
              PressFeedback(
                enabled: true,
                showOverlay: false,
                child: ElevatedButton(
                  onPressed: onReconnect ?? () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: C.ink,
                    foregroundColor: Colors.white,
                    shape: const StadiumBorder(),
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                  ),
                  child: const Text('Reconnect', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AccountRow extends StatelessWidget {
  final LinkedAccount a;
  const _AccountRow(this.a);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconBadge(AppIcons.of(a.iconKey), size: 48),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a.name, style: const TextStyle(fontSize: 18)),
                Text(a.subtitle, style: TextStyle(fontSize: 14, color: C.muted)),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_outline, size: 20),
                    const SizedBox(width: 6),
                    Expanded(child: Text(a.syncLabel, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                  ],
                ),
              ],
            ),
          ),
          Text(Fmt.money(a.balance), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
