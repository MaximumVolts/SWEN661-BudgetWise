import 'dart:async' show StreamController;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import '../models/money.dart' show Money;
import 'calendar.dart' show Calendar;
import 'date_labels.dart' show DateLabels;
import '../models/goal.dart' show GoalContribution, GoalIcon, SavingsGoal, SavingsGoalsData;
import '../repositories/goal_repository.dart' show GoalRepository;
import 'goal_service.dart' show GoalService;
import 'validators.dart' show Validators;

/// [GoalService] backed by a [GoalRepository].
/// BUSINESS RULES: total saved across goals, the summary line, and applying contributions; a new
/// goal has a name of up to 40 characters, a target of $1–$10,000,000, an amount already saved
/// from $0 up to the target, and an optional target date that isn't in the past; a goal with a
/// target date and money still to save suggests how much to save each month to reach it.
class RepositoryGoalService implements GoalService {
  static const _maxName = 40;
  static const _maxTarget = 10000000.0;
  static const _icons = [
    GoalIcon('savings', 'Piggy bank'),
    GoalIcon('home', 'Home'),
    GoalIcon('car', 'Car'),
    GoalIcon('laptop', 'Laptop'),
    GoalIcon('shield', 'Emergency fund'),
    GoalIcon('fitness', 'Fitness'),
    GoalIcon('play', 'Fun'),
    GoalIcon('wallet', 'Other'),
  ];

  final GoalRepository _repository;
  final DateTime Function() _now;
  final _changes = StreamController<void>.broadcast();
  RepositoryGoalService(this._repository, {DateTime Function()? now}) : _now = now ?? DateTime.now;

  @override
  List<GoalIcon> get icons => _icons;

  @override
  Stream<void> get changes => _changes.stream;

  @override
  Future<SavingsGoalsData> getGoals() async {
    final goals = [for (final g in await _repository.fetchGoals()) _withAdvice(g)];
    if (goals.isEmpty) return const SavingsGoalsData.empty();
    final known = goals.map((g) => g.saved).whereType<double>();
    return SavingsGoalsData(
      totalSaved: known.isEmpty ? null : known.fold<double>(0, (sum, v) => sum + v),
      subtitle: '${goals.length} ${goals.length == 1 ? 'goal' : 'goals'} · kept separate from your spending budgets',
      goals: goals,
    );
  }

  /// A goal with a target date gets "By Jun 2027" and, while there's money still to save, a tip
  /// with the monthly amount needed. A named goal without one says "No target date".
  SavingsGoal _withAdvice(SavingsGoal g) {
    final date = g.targetDate;
    if (date == null) return g.name != null && g.subtitle == null ? g.copyWith(subtitle: 'No target date') : g;
    final by = '${DateLabels.monthAbbr(date.month)} ${date.year}';
    final remaining = g.remaining;
    if (remaining == null || remaining <= 0) return g.copyWith(subtitle: 'By $by · goal reached');
    final today = Calendar.dateOnly(_now());
    final months = ((date.year - today.year) * 12 + date.month - today.month).clamp(1, 1200);
    final perMonth = Money.format(remaining / months, decimals: 0);
    return g.copyWith(subtitle: 'By $by', tip: 'Save $perMonth a month to reach it by $by.', tipHighlight: '$perMonth a month');
  }

  @override
  Future<void> addGoal({
    required String name,
    required String target,
    required String saved,
    required DateTime? targetDate,
    required String? iconKey,
  }) async {
    final trimmed = name.trim();
    final t = Validators.money(target, what: 'target', max: _maxTarget);
    final s = saved.trim().isEmpty ? (value: 0.0, error: null) : Validators.money(saved, what: 'amount', min: 0, max: _maxTarget);
    final today = Calendar.dateOnly(_now());
    final errors = <String, String>{
      if (trimmed.isEmpty)
        'name': 'Enter a name'
      else if (trimmed.length > _maxName)
        'name': 'Keep the name under $_maxName characters',
      if (t.error case final e?) 'target': e,
      if (s.error case final e?)
        'saved': e
      else if (t.value != null && s.value! > t.value!)
        'saved': "That's more than the target",
      if (targetDate != null && Calendar.dateOnly(targetDate).isBefore(today)) 'targetDate': "Choose a date that isn't in the past",
      if (!_icons.any((i) => i.key == iconKey)) 'icon': 'Choose an icon',
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);
    await _repository.saveGoal(SavingsGoal(
      id: '',
      name: trimmed,
      target: t.value,
      saved: s.value,
      iconKey: iconKey!,
      targetDate: targetDate == null ? null : Calendar.dateOnly(targetDate),
    ));
    _changes.add(null);
  }

  @override
  Future<void> addContribution({required String goalId, required double amount}) async {
    final goal = await _repository.fetchGoal(goalId);
    if (goal == null) throw const AppException('That savings goal no longer exists.');
    await _repository.saveGoal(goal.copyWith(
      saved: (goal.saved ?? 0) + amount,
      contributions: [GoalContribution(dateLabel: DateLabels.short(_now()), amount: amount), ...goal.contributions],
    ));
    _changes.add(null);
  }
}
