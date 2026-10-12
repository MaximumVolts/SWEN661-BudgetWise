/// Budgets: per-period summaries and per-category limits.
library;

import 'transaction.dart' show TransactionItem;

enum BudgetStatus { onTrack, nearLimit, over }

class BudgetCategory {
  final String id;
  final String name;
  final String iconKey;
  final double spent;
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
  double get remaining => limit - spent;
  double get progress => limit <= 0 ? 0 : (spent / limit).clamp(0.0, 1.0).toDouble();
}

class BudgetSummary {
  final String periodLabel;
  final double spent;
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
  double get remaining => limit - spent;
  double get progress => limit <= 0 ? 0 : (spent / limit).clamp(0.0, 1.0).toDouble();
}

class BudgetCategoryDetailData {
  final String name;
  final String periodLabel; // "Spent in October"
  final double spent;
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
  double get remaining => limit - spent;
  double get progress => limit <= 0 ? 0 : (spent / limit).clamp(0.0, 1.0).toDouble();
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
