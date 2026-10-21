import 'dart:io' show Directory, File;
import 'package:flutter/material.dart' show MaterialApp;
import 'package:flutter_test/flutter_test.dart'
    show expect, find, findsOneWidget, group, isEmpty, isNotEmpty, isNull, isTrue, setUp, test, testWidgets;
import 'package:pace_app/models/goal.dart' show SavingsGoal, SavingsGoalsData;
import 'package:pace_app/repositories/goal_repository.dart' show InMemoryGoalRepository;
import 'package:pace_app/services/repository_goal_service.dart' show RepositoryGoalService;
import 'package:pace_app/views/screens/savings_goals_screen.dart' show SavingsGoalsScreen;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/sqlite_goal_repository.dart' show SqliteGoalRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show databaseFactoryFfi, sqfliteFfiInit;

import 'helpers.dart' show fieldErrors;

void main() {
  group('RepositoryGoalService', () {
    test('empty repository yields empty data', () async {
      final data = await RepositoryGoalService(InMemoryGoalRepository()).getGoals();
      expect(data.isEmpty, isTrue);
      expect(data.totalSaved, isNull);
      expect(data.subtitle, isNull);
    });

    test('totals known amounts and applies contributions', () async {
      final repo = InMemoryGoalRepository([
        const SavingsGoal(id: 'a', saved: 100, target: 500),
        const SavingsGoal(id: 'b'),
      ]);
      final service = RepositoryGoalService(repo);
      expect((await service.getGoals()).totalSaved, 100);

      await service.addContribution(goalId: 'a', amount: 50);
      final a = (await repo.fetchGoal('a'))!;
      expect(a.saved, 150);
      expect(a.contributions.single.amount, 50);
    });
  });

  group('RepositoryGoalService.addGoal', () {
    final today = DateTime(2026, 10, 12);
    late InMemoryGoalRepository repo;
    late RepositoryGoalService service;
    setUp(() {
      repo = InMemoryGoalRepository();
      service = RepositoryGoalService(repo, now: () => today);
    });

    Future<void> add({String name = 'Trip', String target = '3000', String saved = '', DateTime? date, String? icon = 'car'}) =>
        service.addGoal(name: name, target: target, saved: saved, targetDate: date, iconKey: icon);

    test('stores the goal and announces it', () async {
      var changes = 0;
      final sub = service.changes.listen((_) => changes++);
      await add(name: '  Trip to Japan ', target: r'$3,000', saved: '600');
      await Future<void>.delayed(Duration.zero);
      final g = (await repo.fetchGoals()).single;
      expect((g.name, g.target, g.saved, g.iconKey, g.targetDate), ('Trip to Japan', 3000.0, 600.0, 'car', null));
      expect(g.id, isNotEmpty);
      expect(changes, 1);
      await sub.cancel();
    });

    test('an empty "saved so far" starts at zero; two goals get their own ids', () async {
      await add();
      await add(name: 'Bike');
      final goals = await repo.fetchGoals();
      expect(goals.first.saved, 0);
      expect(goals.map((g) => g.id).toSet().length, 2);
    });

    test('reports every invalid field and stores nothing', () async {
      final errors = await fieldErrors(
          () => add(name: ' ', target: '0', saved: 'lots', date: today.subtract(const Duration(days: 1)), icon: null));
      expect(errors.keys.toSet(), {'name', 'target', 'saved', 'targetDate', 'icon'});
      expect((await fieldErrors(() => add(target: '100', saved: '150')))['saved'], "That's more than the target");
      expect((await fieldErrors(() => add(name: 'x' * 41)))['name'], 'Keep the name under 40 characters');
      expect(await repo.fetchGoals(), isEmpty);
    });

    test('a target date gives "By …" and how much to save each month', () async {
      await add(target: '3000', saved: '600', date: DateTime(2027, 4, 1)); // 6 months away
      final g = (await service.getGoals()).goals.single;
      expect(g.subtitle, 'By Apr 2027');
      expect(g.tip, r'Save $400 a month to reach it by Apr 2027.');
      expect(g.tipHighlight, r'$400 a month');

      await add(name: 'Done', target: '100', saved: '100', date: DateTime(2027, 1, 1));
      expect((await service.getGoals()).goals.last.subtitle, 'By Jan 2027 · goal reached');
      await add(name: 'Someday');
      expect((await service.getGoals()).goals.last.subtitle, 'No target date');
    });
  });

  test('SqliteGoalRepository: per user, survives a restart, deleted with the account', () async {
    sqfliteFfiInit();
    final dir = Directory.systemTemp.createTempSync('pace_goals_test');
    PaceDatabase open() => PaceDatabase(
        factory: databaseFactoryFfi, path: '${dir.path}/pace.db', loadAsset: (asset) => File(asset).readAsString());
    var pace = open();
    final users = SqliteUserAccountRepository(pace);
    final ada = (await users.create(username: 'ada', passwordHash: 'h')).id;
    final bo = (await users.create(username: 'bob', passwordHash: 'h')).id;
    String? me = ada;
    final service = RepositoryGoalService(SqliteGoalRepository(pace, currentUserId: () => me), now: () => DateTime(2026, 10, 12));
    await service.addGoal(name: 'Trip', target: '3000', saved: '600', targetDate: DateTime(2027, 4, 1), iconKey: 'car');
    await service.addContribution(goalId: (await service.getGoals()).goals.single.id, amount: 50);
    me = bo;
    expect((await service.getGoals()).isEmpty, isTrue); // only Ada's
    await pace.close();

    pace = open(); // restart
    me = ada;
    final after = (await RepositoryGoalService(SqliteGoalRepository(pace, currentUserId: () => me)).getGoals()).goals.single;
    expect((after.name, after.target, after.saved, after.iconKey, after.targetDate), ('Trip', 3000.0, 650.0, 'car', DateTime(2027, 4, 1)));
    expect(after.contributions.single.amount, 50);

    await SqliteUserAccountRepository(pace).delete(ada);
    final db = await pace.database;
    expect(await db.query('savings_goals'), isEmpty);
    expect(await db.query('goal_contributions'), isEmpty);
    await pace.close();
    dir.deleteSync(recursive: true);
  });

  testWidgets('screen shows missing-data placeholders', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SavingsGoalsScreen(data: SavingsGoalsData.empty())));
    expect(find.text('--'), findsOneWidget);
    expect(find.text('No savings goals yet'), findsOneWidget);

    await tester.pumpWidget(const MaterialApp(
      home: SavingsGoalsScreen(data: SavingsGoalsData(goals: [SavingsGoal(id: 'x')])),
    ));
    expect(find.text('Unnamed goal'), findsOneWidget);
    expect(find.text('No details available'), findsOneWidget);
    expect(find.text('-- saved'), findsOneWidget);
    expect(find.text('-- to go'), findsOneWidget);
  });
}
