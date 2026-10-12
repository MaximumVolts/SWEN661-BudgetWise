import 'package:flutter/material.dart'
    show BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, IconData, Icons, Padding, Row,
        SafeArea, Scaffold, SingleChildScrollView, SizedBox, StatelessWidget, Text, TextStyle, VoidCallback, Widget;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show IconBadge, PaceCard, PaceTopBar, PillButton, Tap;

/// 03 - Connect Bank
class ConnectBankScreen extends StatelessWidget {
  final bool isLoading;
  final VoidCallback? onConnect; // e.g. open Plaid Link
  final VoidCallback? onNotNow;
  final VoidCallback? onBack;

  const ConnectBankScreen({super.key, this.isLoading = false, this.onConnect, this.onNotNow, this.onBack});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Connect your bank', back: true, onBack: onBack),
            const Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 12),
                    Text('Bring your accounts together', style: T.h1),
                    SizedBox(height: 10),
                    Text('Securely connect your bank to see spending, bills, budgets and cash flow in one place.',
                        style: TextStyle(fontSize: 16, color: C.muted, height: 1.35)),
                    SizedBox(height: 22),
                    PaceCard(
                      radius: 24,
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _Point(Icons.visibility_off_outlined, 'Pace never sees your bank login',
                              'You sign in through Plaid. Pace never stores your username or password.'),
                          SizedBox(height: 16),
                          _Point(Icons.visibility_outlined, 'Read-only access',
                              "Pace sees balances and transactions. It can't move your money."),
                          SizedBox(height: 16),
                          _Point(Icons.lock_outline, 'Encrypted in transit and at rest',
                              "Your financial data is protected wherever it's sent or stored."),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: Column(
                children: [
                  PillButton(isLoading ? 'Connecting…' : 'Connect with Plaid', icon: Icons.link, onPressed: isLoading ? null : onConnect),
                  const SizedBox(height: 18),
                  Tap(onTap: onNotNow, child: const Text('Not now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Point extends StatelessWidget {
  final IconData icon;
  final String title, body;
  const _Point(this.icon, this.title, this.body);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        IconBadge(icon, size: 48),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(body, style: const TextStyle(fontSize: 17, color: C.muted, height: 1.3)),
            ],
          ),
        ),
      ],
    );
  }
}
