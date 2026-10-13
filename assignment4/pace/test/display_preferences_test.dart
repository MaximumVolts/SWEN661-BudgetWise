import 'dart:io' show Directory, File;
import 'package:flutter/material.dart' show Container, Directionality, Icon, Icons, Scaffold, Switch, TextDirection, ThemeData, Theme;
import 'package:flutter_test/flutter_test.dart'
    show
        expect,
        find,
        findsNothing,
        findsOneWidget,
        group,
        isFalse,
        isNot,
        isTrue,
        setUp,
        setUpAll,
        tearDown,
        test,
        testWidgets;
import 'package:pace_app/models/budget.dart' show BudgetStatus;
import 'package:pace_app/models/user_preferences.dart' show UserPreferences;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/preferences_repository.dart' show InMemoryPreferencesRepository;
import 'package:pace_app/repositories/sqlite_preferences_repository.dart' show SqlitePreferencesRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/theme.dart' show C, Palette;
import 'package:pace_app/views/widgets/display_options.dart' show PaceDisplay;
import 'package:pace_app/views/widgets/status_mark.dart' show BudgetStatusMark;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show databaseFactoryFfi, sqfliteFfiInit;


import 'helpers.dart' show createAda, NoGoogle;
void main() {
  group('SqlitePreferencesRepository (real schema)', () {
    late Directory dir;
    late PaceDatabase db;
    setUpAll(sqfliteFfiInit);
    setUp(() {
      dir = Directory.systemTemp.createTempSync('pace_prefs');
      db = PaceDatabase(factory: databaseFactoryFfi, path: '${dir.path}/pace.db', loadAsset: (a) => File(a).readAsString());
    });
    tearDown(() async {
      await db.close();
      dir.deleteSync(recursive: true);
    });

    test('a new user starts with the defaults; changes are saved per user', () async {
      final users = SqliteUserAccountRepository(db);
      final prefs = SqlitePreferencesRepository(db);
      final ada = await users.create(username: 'ada');
      final bo = await users.create(username: 'bo');
      expect(await prefs.load(ada.id), UserPreferences.defaults);

      await prefs.save(ada.id, const UserPreferences(highContrast: true, colorblindMode: true));
      expect(await prefs.load(ada.id), const UserPreferences(highContrast: true, colorblindMode: true));
      expect(await prefs.load(bo.id), UserPreferences.defaults);
      final row = (await (await db.database).query('user_preferences', where: 'user_id = ?', whereArgs: [ada.id])).single;
      expect(row['high_contrast'], 1);
      expect(row['colorblind_mode'], 1);
    });
  });

  group('Settings service', () {
    test('toggles are saved for the signed-in user and announced; signing out restores the defaults', () async {
      final users = InMemoryUserAccountRepository();
      final services = demoServices(
        accounts: users,
        google: NoGoogle(),
        hasher: const PasswordHasher(iterations: 1000),
        banks: InMemoryLinkedBankRepository(),
        preferencesStore: InMemoryPreferencesRepository(),
      );
      final announced = <UserPreferences>[];
      final sub = services.settings.preferenceChanges.listen(announced.add);
      await createAda(services.auth);
      await services.settings.setHighContrast(true);
      await services.settings.setColorblindMode(true);
      expect(await services.settings.preferences(), const UserPreferences(highContrast: true, colorblindMode: true));
      expect((await services.settings.load()).highContrast, isTrue);

      await services.auth.signOut();
      await Future<void>.delayed(Duration.zero);
      expect(await services.settings.preferences(), UserPreferences.defaults);
      expect(announced.last, UserPreferences.defaults);

      await services.auth.signIn(username: 'ada', password: 'secret123');
      await Future<void>.delayed(Duration.zero);
      expect(announced.last, const UserPreferences(highContrast: true, colorblindMode: true)); // remembered
      await sub.cancel();
    });
  });

  testWidgets('Settings toggles switch the whole app to high contrast and colorblind mode', (tester) async {
    final services = demoServices(
      accounts: InMemoryUserAccountRepository(),
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
      banks: InMemoryLinkedBankRepository(),
      preferencesStore: InMemoryPreferencesRepository(),
    );
    await tester.runAsync(() => createAda(services.auth));
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.settings]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(C.highContrast, isFalse);
    expect(tester.widget<PaceDisplay>(find.byType(PaceDisplay)).colorblind, isFalse); // off by default
    expect(find.text('Colorblind mode'), findsOneWidget);
    expect(find.text('Chart patterns and icons'), findsNothing);
    // The preview under the switch shows the current look: dots, no shapes.
    await tester.scrollUntilVisible(find.text('PREVIEW · COLORBLIND MODE OFF'), 200);
    expect(find.byIcon(Icons.check_circle_outline), findsNothing);

    // High contrast (first switch under Accessibility & display).
    await tester.scrollUntilVisible(find.text('High contrast'), 200);
    await tester.tap(find.byType(Switch).at(0));
    await tester.pumpAndSettle();
    expect(C.highContrast, isTrue);
    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold).first);
    final background = scaffold.backgroundColor ?? Theme.of(tester.element(find.byType(Scaffold).first)).scaffoldBackgroundColor;
    expect(background, Palette.highContrast.bg);

    // Colorblind mode on: shapes / patterns, and the colorblind-safe palette (with high contrast).
    await tester.tap(find.byType(Switch).at(1));
    await tester.pumpAndSettle();
    expect(tester.widget<PaceDisplay>(find.byType(PaceDisplay)).colorblind, isTrue);
    expect(C.colorblind, isTrue);
    // …and it's obvious right away: the preview switches to shapes, and a message confirms it.
    expect(find.text('PREVIEW · COLORBLIND MODE ON'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle_outline), findsOneWidget);
    expect(find.byIcon(Icons.warning_amber_rounded), findsOneWidget);
    expect(find.byIcon(Icons.error_outline), findsOneWidget);
    expect(find.textContaining('Colorblind mode on'), findsOneWidget);
    expect(C.olive, Palette.highContrast.colorblindSafe().olive);
    expect(C.red, Palette.highContrast.colorblindSafe().red);
    expect(C.red, isNot(Palette.highContrast.red));

    // High contrast off again: still colorblind-safe.
    await tester.tap(find.byType(Switch).at(0));
    await tester.pumpAndSettle();
    expect(C.olive, Palette.standard.colorblindSafe().olive);

    router.dispose();
    await tester.pumpWidget(Container());
    expect(C.highContrast, isFalse); // reset with the app
  });

  testWidgets('budget status marks: shapes in colorblind mode, colored dots otherwise', (tester) async {
    Future<void> show(bool colorblind) => tester.pumpWidget(Theme(
          data: ThemeData(),
          child: Directionality(
            textDirection: TextDirection.ltr,
            child: PaceDisplay(
              colorblind: colorblind,
              showChartValues: true,
              child: BudgetStatusMark(BudgetStatus.over, color: C.red),
            ),
          ),
        ));
    await show(true);
    expect(find.byIcon(Icons.error_outline), findsOneWidget);
    await show(false);
    expect(find.byType(Icon), findsNothing);
    expect(find.byType(Container), findsOneWidget);
  });
}
