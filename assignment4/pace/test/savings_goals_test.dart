import 'package:flutter/material.dart' show MaterialApp;
import 'package:flutter_test/flutter_test.dart'
    show expect, find, findsOneWidget, group, isNull, isTrue, test, testWidgets;
import 'package:pace_app/models/goal.dart' show SavingsGoal, SavingsGoalsData;
import 'package:pace_app/repositories/goal_repository.dart' show InMemoryGoalRepository;
import 'package:pace_app/services/repository_goal_service.dart' show RepositoryGoalService;
import 'package:pace_app/views/screens/savings_goals_screen.dart' show SavingsGoalsScreen;

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
