import 'package:flutter/widgets.dart' show RouteInformation, RouteInformationParser;
import 'app_route.dart' show AppRoute;

/// Converts between the platform URL (deep links, browser address bar) and the route stack.
class AppRouteParser extends RouteInformationParser<List<AppRoute>> {
  /// Used for "/" and any URL that doesn't match a route.
  final List<AppRoute> fallbackStack;
  const AppRouteParser({this.fallbackStack = const [AppRoute.home]});

  @override
  Future<List<AppRoute>> parseRouteInformation(RouteInformation routeInformation) async {
    final route = AppRoute.tryParse(routeInformation.uri);
    return route == null ? fallbackStack : AppRoute.stackFor(route);
  }

  @override
  RouteInformation? restoreRouteInformation(List<AppRoute> configuration) =>
      configuration.isEmpty ? null : RouteInformation(uri: configuration.last.uri);
}
