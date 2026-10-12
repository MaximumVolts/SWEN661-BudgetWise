import 'package:flutter/material.dart'
    show BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, IconData, Icons, Padding, Row,
        SafeArea, Scaffold, SingleChildScrollView, SizedBox, StatelessWidget, Text, TextStyle, VoidCallback, Widget;
import '../theme.dart' show C, T;
import '../widgets/sandbox_notices.dart' show ConnectingToTestEndpoint, TestModeBanner;
import '../widgets/widgets.dart' show IconBadge, PaceCard, PaceTopBar, PillButton;

/// 03 - Connect Bank. This prototype only ever links a Plaid *Sandbox* test bank, so the screen
/// says so up front and, while connecting, shows a test-endpoint notice instead of any fields:
/// there is nowhere to enter real bank details.
class ConnectBankScreen extends StatelessWidget {
  final bool isLoading;
  final VoidCallback? onConnect;
  final VoidCallback? onBack;

  const ConnectBankScreen({super.key, this.isLoading = false, this.onConnect, this.onBack});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Connect your bank', back: true, onBack: isLoading ? null : onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    const TestModeBanner(),
                    const SizedBox(height: 18),
                    if (isLoading)
                      const ConnectingToTestEndpoint()
                    else ...[
                      Text('Bring your accounts together', style: T.h1),
                      const SizedBox(height: 10),
                      Text('Connect a bank to see spending, bills, budgets and cash flow in one place.',
                          style: TextStyle(fontSize: 16, color: C.muted, height: 1.35)),
                      const SizedBox(height: 22),
                      const PaceCard(
                        radius: 24,
                        padding: EdgeInsets.all(16),
                        child: Column(
                          children: [
                            _Point(Icons.science_outlined, 'Test bank only',
                                "Pace links Plaid's sandbox test bank. You won't be asked for, and can't enter, real bank details."),
                            SizedBox(height: 16),
                            _Point(Icons.visibility_outlined, 'Read-only access',
                                "Pace sees balances and transactions. It can't move money."),
                            SizedBox(height: 16),
                            _Point(Icons.phone_iphone, 'Stays on this device',
                                'The linked test accounts are saved only on this phone.'),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: Column(
                children: [
                  PillButton(
                    isLoading ? 'Connecting to test bank…' : 'Connect test bank with Plaid',
                    icon: Icons.link,
                    onPressed: isLoading ? null : onConnect,
                  ),
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
              Text(body, style: TextStyle(fontSize: 17, color: C.muted, height: 1.3)),
            ],
          ),
        ),
      ],
    );
  }
}
