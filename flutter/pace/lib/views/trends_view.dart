import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/trends_controller.dart' show TrendsController;
import 'screens/trends_screen.dart' show TrendsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class TrendsView extends StatelessWidget {
  final TrendsController controller;
  const TrendsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<TrendsController>(
        controller: controller,
        builder: (context, c) => TrendsScreen(
          headline: c.data!.headline,
          trends: c.data!.trends,
          aboutText: c.data!.aboutText,
          onBack: c.back,
          onTrendAction: c.openTrend,
          onNavTap: c.openTab,
        ),
      );
}
