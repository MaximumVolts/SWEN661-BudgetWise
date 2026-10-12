import 'package:flutter/material.dart' show BuildContext, Element, MaterialApp, State, StatefulWidget, Widget;
import '../controllers/display_controller.dart' show DisplayController;
import 'theme.dart' show C, paceTheme;
import 'navigation/app_router.dart' show AppRouter;
import 'widgets/display_options.dart' show PaceDisplay;

/// Root widget. Uses Navigator 2.0 via [MaterialApp.router].
///
///   final router = AppRouter.create(services: myServices, guard: myGuard);
///   runApp(PaceApp(router: router));
///
/// Also applies the user's display preferences everywhere: high contrast and colorblind mode (the
/// palette, plus [PaceDisplay] for colorblind shapes / patterns), updating as soon as they change, or someone signs in or out.
class PaceApp extends StatefulWidget {
  final AppRouter router;
  const PaceApp({super.key, required this.router});

  @override
  State<PaceApp> createState() => _PaceAppState();
}

class _PaceAppState extends State<PaceApp> {
  late final DisplayController _display = widget.router.dependencies.display();
  bool _highContrast = false, _colorblind = false;

  @override
  void initState() {
    super.initState();
    C.use(highContrast: false, colorblind: false);
    _display.addListener(_apply);
    _display.load();
  }

  void _apply() {
    if (!mounted) return;
    final p = _display.preferences;
    setState(() => C.use(highContrast: p.highContrast, colorblind: p.colorblindMode));
    if (p.highContrast == _highContrast && p.colorblindMode == _colorblind) return;
    _highContrast = p.highContrast;
    _colorblind = p.colorblindMode;
    // Screens read palette colors (C.ink …) while building, so rebuild all of them. Marking
    // elements dirty keeps their state (controllers, scroll positions, typed text).
    void rebuild(Element e) {
      e.markNeedsBuild();
      e.visitChildren(rebuild);
    }

    (context as Element).visitChildren(rebuild);
  }

  @override
  void dispose() {
    _display
      ..removeListener(_apply)
      ..dispose();
    C.use(highContrast: false, colorblind: false);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final prefs = _display.preferences;
    return PaceDisplay(
      colorblind: prefs.colorblindMode,
      showChartValues: prefs.showChartValues,
      child: MaterialApp.router(
        title: 'Pace',
        debugShowCheckedModeBanner: false,
        theme: paceTheme(),
        routerDelegate: widget.router.delegate,
        routeInformationParser: widget.router.parser, // default PlatformRouteInformationProvider handles deep links & the browser URL bar;
        // default RootBackButtonDispatcher routes Android back to the delegate (popRoute).
      ),
    );
  }
}
