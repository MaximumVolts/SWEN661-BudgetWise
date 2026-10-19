import 'dart:async' show StreamSubscription;
import '../../services/auth_service.dart' show AuthService;
import '../../controllers/app_dependencies.dart' show AppDependencies;
import '../../services/app_services.dart' show AppServices;
import 'app_modals.dart' show AppModals, DefaultAppModals;
import 'app_pages.dart' show AppPages;
import 'app_route.dart' show AppRoute;
import 'app_route_parser.dart' show AppRouteParser;
import 'app_router_delegate.dart' show AppRouterDelegate, RouteGuard;
import 'router_app_navigator.dart' show RouterAppNavigator;

/// Everything MaterialApp.router needs, wired together:
///   services → navigator (RouterAppNavigator) → dependencies → pages → delegate
class AppRouter {
  final AppRouterDelegate delegate;
  final AppRouteParser parser;
  final AppDependencies dependencies;
  final StreamSubscription<bool>? _session;
  const AppRouter._(this.delegate, this.parser, this.dependencies, this._session);

  /// Default session guard: signed-out users can only see public routes; signed-in users skip sign-in.
  static RouteGuard sessionGuard(AuthService auth) => (target) {
        if (!auth.isSignedIn && !target.isPublic) return AppRoute.signIn;
        if (auth.isSignedIn && target == AppRoute.signIn) return AppRoute.home;
        return null;
      };

  factory AppRouter.create({
    required AppServices services,
    AppModals modals = const DefaultAppModals(),
    List<AppRoute> initialStack = const [AppRoute.home],
    RouteGuard? guard,
  }) {
    final effectiveGuard = guard ?? sessionGuard(services.auth);
    final delegate = AppRouterDelegate(initialStack: initialStack, guard: effectiveGuard);
    final navigator = RouterAppNavigator(delegate, modals);
    final deps = AppDependencies(services: services, navigator: navigator);
    delegate.pageBuilder = AppPages(deps).build;
    // Session changes (e.g. token expiry, sign-out elsewhere) re-run the guard over the stack.
    final sub = services.auth.signedInChanges.listen((_) => delegate.revalidate());
    return AppRouter._(delegate, AppRouteParser(fallbackStack: initialStack), deps, sub);
  }

  void dispose() {
    _session?.cancel();
    delegate.dispose();
  }
}
