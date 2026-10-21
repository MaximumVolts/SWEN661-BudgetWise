import 'package:flutter/material.dart'
    show BuildContext, ChangeNotifier, GlobalKey, LocalKey, MaterialPageRoute, Navigator, NavigatorState, Page,
        PageRouteBuilder, PopNavigatorRouterDelegateMixin, Route, RouterDelegate, ValueKey, Widget;
import 'app_route.dart' show AppRoute;

/// Builds the screen for a route. Called once per stack entry (so controllers survive rebuilds).
typedef RoutePageBuilder = Widget Function(AppRoute route);

/// Redirect hook. Return a different route to redirect, or null to allow [target].
/// Typical use: send signed-out users to sign-in and signed-in users away from it.
typedef RouteGuard = AppRoute? Function(AppRoute target);

class _Entry {
  final int id;
  final AppRoute route;
  Widget? child;
  _Entry(this.id, this.route);
  LocalKey get key => ValueKey<int>(id);
}

class _AppPage extends Page<void> {
  final Widget child;
  final bool animated;
  const _AppPage({required LocalKey super.key, required super.name, required this.child, required this.animated});

  @override
  Route<void> createRoute(BuildContext context) => animated
      ? MaterialPageRoute<void>(settings: this, builder: (_) => child)
      : PageRouteBuilder<void>(
          settings: this,
          pageBuilder: (_, __, ___) => child,
          transitionDuration: Duration.zero,
          reverseTransitionDuration: Duration.zero,
        );
}

/// Navigator 2.0 router delegate: the route stack is state; the Navigator renders it as pages.
class AppRouterDelegate extends RouterDelegate<List<AppRoute>>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<List<AppRoute>> {
  AppRouterDelegate({required List<AppRoute> initialStack, this.guard}) {
    _stack = [for (final r in initialStack) _entry(_resolve(r))];
  }

  @override
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

  final RouteGuard? guard;

  /// Set by AppRouter.create once dependencies exist.
  late RoutePageBuilder pageBuilder;

  late List<_Entry> _stack;
  int _nextId = 0;

  _Entry _entry(AppRoute r) => _Entry(_nextId++, r);
  AppRoute _resolve(AppRoute r) => guard?.call(r) ?? r;

  List<AppRoute> get stack => List.unmodifiable([for (final e in _stack) e.route]);
  AppRoute get current => _stack.last.route;

  // ── RouterDelegate ────────────────────────────────────────────────────────

  @override
  List<AppRoute> get currentConfiguration => stack;

  @override
  Future<void> setNewRoutePath(List<AppRoute> configuration) async {
    if (configuration.isEmpty) return;
    final target = _resolve(configuration.last);
    final wanted = target == configuration.last ? configuration : AppRoute.stackFor(target);
    // reuse existing entries (and their controllers) where the stack already matches
    final next = <_Entry>[];
    for (var i = 0; i < wanted.length; i++) {
      next.add(i < _stack.length && _stack[i].route == wanted[i] ? _stack[i] : _entry(wanted[i]));
    }
    _stack = next;
    notifyListeners();
  }

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: [
        for (var i = 0; i < _stack.length; i++)
          _AppPage(
            key: _stack[i].key,
            name: _stack[i].route.uri.toString(),
            child: _stack[i].child ??= pageBuilder(_stack[i].route),
            // tab roots swap instantly; pushed screens animate
            animated: i > 0 && !_stack[i].route.isTabRoot,
          ),
      ],
      onDidRemovePage: (page) {
        _stack.removeWhere((e) => e.key == page.key);
        if (_stack.isEmpty) _stack = [_entry(_resolve(AppRoute.home))];
        notifyListeners();
      },
    );
  }

  // ── Imperative API used by RouterAppNavigator ─────────────────────────────

  void push(AppRoute route) {
    final r = _resolve(route);
    if (_stack.last.route == r) return; // ignore double taps
    _stack.add(_entry(r));
    notifyListeners();
  }

  /// Pops the top route. Returns false if there is nothing to pop.
  bool pop() {
    if (_stack.length <= 1) return false;
    _stack.removeLast();
    notifyListeners();
    return true;
  }

  /// Replaces the whole stack (e.g. after sign-in / sign-out).
  void replaceAll(List<AppRoute> routes) {
    final resolved = [for (final r in routes) _resolve(r)];
    _stack = [for (final r in resolved) _entry(r)];
    notifyListeners();
  }

  /// Switches bottom-nav tab: stack becomes [Home, tab] (or just [Home]); Home is kept alive underneath
  /// so back from any tab returns to it.
  void openTab(AppRoute tab) {
    final target = _resolve(tab);
    if (_stack.last.route == target) return;
    final home = _stack.isNotEmpty && _stack.first.route == AppRoute.home ? _stack.first : _entry(AppRoute.home);
    _stack = target == AppRoute.home ? [home] : [home, _entry(target)];
    notifyListeners();
  }

  /// Re-run the guard over the stack, e.g. after auth state changes.
  void revalidate() {
    for (final e in _stack) {
      final redirect = guard?.call(e.route);
      if (redirect != null && redirect != e.route) {
        replaceAll([redirect]);
        return;
      }
    }
  }
}
