import 'package:flutter/material.dart' show BuildContext, MaterialApp, StatelessWidget, Widget;
import 'theme.dart' show paceTheme;
import 'navigation/app_router.dart' show AppRouter;

/// Root widget. Uses Navigator 2.0 via [MaterialApp.router].
///
///   final router = AppRouter.create(services: myServices, guard: myGuard);
///   runApp(PaceApp(router: router));
class PaceApp extends StatelessWidget {
  final AppRouter router;
  const PaceApp({super.key, required this.router});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Pace',
      debugShowCheckedModeBanner: false,
      theme: paceTheme(),
      routerDelegate: router.delegate,
      routeInformationParser: router.parser,      // default PlatformRouteInformationProvider handles deep links & the browser URL bar;
      // default RootBackButtonDispatcher routes Android back to the delegate (popRoute).
    );
  }
}
