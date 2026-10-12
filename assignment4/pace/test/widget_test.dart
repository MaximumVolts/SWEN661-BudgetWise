import 'package:flutter_test/flutter_test.dart' show expect, find, findsOneWidget, testWidgets;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/sign_in_screen.dart' show SignInScreen;

void main() {
  testWidgets('app starts signed out on the sign-in screen', (tester) async {
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();

    expect(router.delegate.stack, [AppRoute.signIn]);
    expect(find.byType(SignInScreen), findsOneWidget);
    router.dispose();
  });
}
