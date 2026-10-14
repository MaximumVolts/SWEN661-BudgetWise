import 'package:flutter/material.dart'
    show BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, Padding, Row, SafeArea,
        Scaffold, Semantics, SingleChildScrollView, SizedBox, StatelessWidget, Text, TextStyle, ValueChanged, VoidCallback,
        Widget;
import '../../models/linked_bank.dart' show SandboxInstitution;
import '../theme.dart' show C, T;
import '../widgets/sandbox_notices.dart' show ConnectingToTestEndpoint, TestModeBanner;
import '../widgets/widgets.dart' show HairLine, IconBadge, PaceCard, PaceTopBar, PillButton, Tap;

/// Accounts → Add an account: choose one of Plaid's sandbox test banks to link. Banks already
/// connected are shown but can't be picked; there is nowhere to enter real bank details.
class AddAccountScreen extends StatelessWidget {
  final List<SandboxInstitution> institutions;
  final String? selectedId;
  final bool isConnecting;
  final ValueChanged<SandboxInstitution>? onSelect;
  final VoidCallback? onConnect;
  final VoidCallback? onBack;

  const AddAccountScreen({
    super.key,
    required this.institutions,
    this.selectedId,
    this.isConnecting = false,
    this.onSelect,
    this.onConnect,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final selected = institutions.where((i) => i.id == selectedId && !i.isLinked).firstOrNull;
    final allLinked = institutions.isNotEmpty && institutions.every((i) => i.isLinked);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Add an account', back: true, onBack: isConnecting ? null : onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    const TestModeBanner(),
                    const SizedBox(height: 18),
                    if (isConnecting)
                      const ConnectingToTestEndpoint()
                    else ...[
                      Text('Choose a test bank', style: T.h1),
                      const SizedBox(height: 10),
                      Text(
                        allLinked
                            ? "You've connected all of Plaid's test banks."
                            : "These are Plaid's sandbox test banks, filled with sample accounts. "
                                "You won't be asked for, and can't enter, real bank details.",
                        style: TextStyle(fontSize: 16, color: C.muted, height: 1.35),
                      ),
                      const SizedBox(height: 18),
                      PaceCard(
                        radius: 20,
                        padding: EdgeInsets.zero,
                        child: Column(
                          children: [
                            for (var i = 0; i < institutions.length; i++) ...[
                              if (i > 0) const HairLine(),
                              _Bank(
                                institutions[i],
                                selected: institutions[i].id == selected?.id,
                                onTap: institutions[i].isLinked || onSelect == null ? null : () => onSelect!(institutions[i]),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: PillButton(
                isConnecting
                    ? 'Connecting to test bank…'
                    : selected == null
                        ? 'Nothing left to connect'
                        : 'Connect ${selected.name}',
                icon: Icons.link,
                onPressed: isConnecting || selected == null ? null : onConnect,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bank extends StatelessWidget {
  final SandboxInstitution bank;
  final bool selected;
  final VoidCallback? onTap;
  const _Bank(this.bank, {required this.selected, this.onTap});

  @override
  Widget build(BuildContext context) {
    final row = Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconBadge(Icons.account_balance_outlined, size: 44, bg: bank.isLinked ? C.chip : null),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(bank.name,
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w500, color: bank.isLinked ? C.muted : C.ink)),
                if (bank.isLinked) Text('Already connected', style: T.sub),
              ],
            ),
          ),
          if (bank.isLinked)
            Icon(Icons.check_circle_outline, color: C.muted)
          else
            Icon(selected ? Icons.radio_button_checked : Icons.radio_button_unchecked, color: C.ink),
        ],
      ),
    );
    if (onTap == null) return Semantics(enabled: false, child: row);
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: selected,
      child: Tap(onTap: onTap, child: row),
    );
  }
}
