import 'package:flutter/material.dart'
    show BuildContext, Center, Column, CrossAxisAlignment, EdgeInsets, Expanded, Navigator, Padding, SafeArea, Scaffold,
        StatelessWidget, Text, TextAlign, Widget;
import 'theme.dart' show T;
import 'widgets/widgets.dart' show PaceTopBar;

/// Shown for destinations that don't have a designed screen yet (profile, bill detail, …).
/// Replace the corresponding case in `AppPages.build` when you add the real screen.
class PlaceholderView extends StatelessWidget {
  final String title;
  final String? detail;
  const PlaceholderView({super.key, required this.title, this.detail});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PaceTopBar(title, back: true, onBack: () => Navigator.of(context).maybePop()),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Text(detail ?? 'This screen has not been designed yet.', textAlign: TextAlign.center, style: T.body),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
