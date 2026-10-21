import 'package:flutter/material.dart'
    show BorderRadius, BoxDecoration, BuildContext, CircularProgressIndicator, Column, Container, CrossAxisAlignment,
        EdgeInsets, Expanded, FontWeight, Icon, Icons, Row, Semantics, SizedBox, StatelessWidget, Text, TextStyle, Widget;
import '../theme.dart' show C;
import 'widgets.dart' show PaceCard;

// Notices shared by every place that links a Plaid *Sandbox* test bank (Connect bank, Profile).

/// Always visible: makes it clear no real bank is involved.
class TestModeBanner extends StatelessWidget {
  const TestModeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: 'Test mode. Plaid Sandbox. No real bank accounts.',
      excludeSemantics: true,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(12)),
        child: const Row(
          children: [
            Icon(Icons.science_outlined, size: 22),
            SizedBox(width: 10),
            Expanded(
              child: Text('Test mode · Plaid Sandbox · no real bank accounts',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}

/// Shown after "Connect" is pressed: a status message, never a form.
class ConnectingToTestEndpoint extends StatelessWidget {
  const ConnectingToTestEndpoint({super.key});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: PaceCard(
        radius: 24,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 3, color: C.ink)),
                const SizedBox(width: 14),
                const Expanded(child: Text('Connecting to a test endpoint…', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700))),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              "Pace is linking Plaid's sandbox test bank (sandbox.plaid.com). This is a test environment: "
              "no real bank is contacted, and you don't need to (and can't) enter any real account information.",
              style: TextStyle(fontSize: 16, color: C.muted, height: 1.35),
            ),
          ],
        ),
      ),
    );
  }
}
