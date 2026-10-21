import 'package:flutter/material.dart' show runApp;
import 'views/pace_app.dart' show PaceApp;
import 'views/navigation/app_router.dart' show AppRouter;
// DEV ONLY: remove with lib/services/demo/ once real services exist
import 'services/demo/demo_services.dart' show demoServices;

void main() {
  // Replace demoServices() with your real AppServices(...) implementation.
  final router = AppRouter.create(services: demoServices());
  runApp(PaceApp(router: router));
}
