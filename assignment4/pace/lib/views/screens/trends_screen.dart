import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets, Expanded,
        FontWeight, Icon, Icons, ListView, MainAxisSize, Padding, Row, SafeArea, Scaffold, SizedBox, StatelessWidget,
        Text, TextDecoration, TextStyle, ValueChanged, VoidCallback, Widget;
import '../../models/trend.dart' show TrendDirection, TrendItem;
import '../theme.dart' show C;
import '../widgets/widgets.dart' show PaceCard, PaceNavBar, Tap;

/// 17 - Trends (Plaid TrendScore)
class TrendsScreen extends StatelessWidget {
  final String headline; // "4 trends in your accounts"
  final List<TrendItem> trends;
  final String? aboutText;
  final VoidCallback? onBack;
  final ValueChanged<TrendItem>? onTrendAction;
  final ValueChanged<int>? onNavTap;

  const TrendsScreen({
    super.key,
    required this.headline,
    required this.trends,
    this.aboutText,
    this.onBack,
    this.onTrendAction,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 0, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            Row(
              children: [
                Tap(onTap: onBack, semanticLabel: 'Back', child: const Icon(Icons.arrow_back, size: 28)),
                const SizedBox(width: 16),
                const Text('Plaid TrendScore', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
              ],
            ),
            const SizedBox(height: 18),
            Text(headline, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, height: 1.2)),
            const SizedBox(height: 8),
            const Text("What's changing in your money, in plain language. Tap any trend to see the transactions behind it.",
                style: TextStyle(fontSize: 16, color: C.muted, height: 1.35)),
            const SizedBox(height: 16),
            for (final t in trends)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: PaceCard(
                  radius: 14,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(12)),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(t.direction == TrendDirection.falling ? Icons.trending_down : Icons.trending_up, size: 16),
                          const SizedBox(width: 4),
                          Text(t.directionLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                        ]),
                      ),
                      const SizedBox(height: 12),
                      Text(t.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      Text(t.body, style: const TextStyle(fontSize: 16, color: C.muted, height: 1.4)),
                      const SizedBox(height: 12),
                      Tap(
                        onTap: onTrendAction == null ? null : () => onTrendAction!(t),
                        child: Row(children: [
                          Text(t.actionLabel, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, decoration: TextDecoration.underline)),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward, size: 16),
                        ]),
                      ),
                    ],
                  ),
                ),
              ),
            if (aboutText != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(14), border: Border.all(color: C.line)),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('About these insights', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          const SizedBox(height: 2),
                          Text(aboutText!, style: const TextStyle(fontSize: 16, color: C.muted, height: 1.35)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
