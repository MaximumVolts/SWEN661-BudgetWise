/// Cash flow projection.
library;

enum AmountTone { neutral, positive, negative }

class CashFlowChartData {
  /// Projected cash balance per step, left → right.
  final List<double> values;
  /// Labels spread evenly under the chart.
  final List<String> xLabels;
  /// Horizontal gridline values (e.g. 2000, 3000, 4000).
  final List<double> gridValues;
  /// Index in [values] of the lowest point to annotate (optional).
  final int? lowIndex;
  final String? lowLabel;
  final String? endLabel;
  const CashFlowChartData({
    required this.values,
    this.xLabels = const [],
    this.gridValues = const [],
    this.lowIndex,
    this.lowLabel,
    this.endLabel,
  });
}

class BreakdownLine {
  final String title;
  final String subtitle;
  final double amount;
  final AmountTone tone;
  /// Set on a line for income the user added, so it can be removed.
  final String? expectedIncomeId;
  const BreakdownLine(
      {required this.title, required this.subtitle, required this.amount, this.tone = AmountTone.neutral, this.expectedIncomeId});
}

class CashFlowData {
  final List<String> rangeLabels;
  final int selectedRange;
  final List<String> scenarioLabels;
  final int selectedScenario;
  final String projectedDateLabel; // "Projected cash on Nov 17"
  final double projectedAmount;
  final double? lowestAmount;
  final String? lowestDescription; // "around Oct 25, after your card payment"
  final String chartTitle;
  final CashFlowChartData chart;
  final List<BreakdownLine> breakdown;
  const CashFlowData({
    required this.rangeLabels,
    required this.selectedRange,
    required this.scenarioLabels,
    required this.selectedScenario,
    required this.projectedDateLabel,
    required this.projectedAmount,
    required this.chartTitle,
    required this.chart,
    required this.breakdown,
    this.lowestAmount,
    this.lowestDescription,
  });
}

/// One-off money the user expects (a tax refund, a freelance payment…), added to the projection.
class ExpectedIncome {
  final String id;
  final String name;
  final double amount;
  final DateTime date;
  const ExpectedIncome({required this.id, required this.name, required this.amount, required this.date});
}
