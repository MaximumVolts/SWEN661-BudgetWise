/// Budgets: per-period summaries and per-category limits.
library;

import 'transaction.dart' show TransactionItem;

/// Where a budget stands; [label] is how it's named everywhere it's shown.
enum BudgetStatus {
  onTrack('On track'),
  nearLimit('Near limit'),
  over('Over budget');

  const BudgetStatus(this.label);
  final String label;
}

/// Spent against a limit: what's left (negative when over) and how full the bar is (0–1).
mixin BudgetProgress {
  double get spent;
  double get limit;
  double get remaining => limit - spent;
  bool get isOver => remaining < 0;
  double get progress => limit <= 0 ? 0 : (spent / limit).clamp(0.0, 1.0).toDouble();
}

class BudgetCategory with BudgetProgress {
  final String id;
  final String name;
  final String iconKey;
  @override
  final double spent;
  @override
  final double limit;
  final BudgetStatus status;
  const BudgetCategory({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.spent,
    required this.limit,
    required this.status,
  });
}

class BudgetSummary with BudgetProgress {
  final String periodLabel;
  @override
  final double spent;
  @override
  final double limit;
  final BudgetStatus status;
  /// Optional text like "Under budget · 77% used".
  final String? statusLabel;
  const BudgetSummary({
    required this.periodLabel,
    required this.spent,
    required this.limit,
    required this.status,
    this.statusLabel,
  });
}

class BudgetCategoryDetailData with BudgetProgress {
  final String name;
  final String periodLabel; // "Spent in October"
  @override
  final double spent;
  @override
  final double limit;
  final BudgetStatus status;
  final String? paceHeadline;
  final String? paceBody;
  final List<TransactionItem> recent;
  const BudgetCategoryDetailData({
    required this.name,
    required this.periodLabel,
    required this.spent,
    required this.limit,
    required this.status,
    this.paceHeadline,
    this.paceBody,
    this.recent = const [],
  });
}

class BudgetPeriod {
  final String id;
  final String label;
  /// The period the service considers "current" (initially selected in the UI).
  final bool isCurrent;
  const BudgetPeriod({required this.id, required this.label, this.isCurrent = false});
}

class BudgetOverview {
  final BudgetSummary summary;
  final List<BudgetCategory> categories;
  const BudgetOverview({required this.summary, required this.categories});
}

/// A saved budget: the monthly limit for one spending category.
class BudgetSetting {
  final String categoryId;
  final String name;
  final String iconKey;
  final double monthlyLimit;
  const BudgetSetting({required this.categoryId, required this.name, required this.iconKey, required this.monthlyLimit});
}
