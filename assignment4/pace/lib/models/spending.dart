/// Spending overview.
library;

import 'transaction.dart' show TransactionItem;

class BarDatum {
  final String label; // x-axis label ('' to hide)
  final double value;
  /// Spoken description, e.g. "October 25". Falls back to [label] then "Bar n".
  final String? semanticLabel;
  const BarDatum({required this.label, required this.value, this.semanticLabel});
}

class SpendingCategory {
  final String id;
  final String name;
  final String iconKey;
  final double amount;
  /// null => "No change".
  final double? changePercent;
  /// 0..1 share used for the small bar.
  final double share;
  const SpendingCategory({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.amount,
    required this.share,
    this.changePercent,
  });
}

class SpendingData {
  final List<String> rangeLabels; // ['Month','3 months','Year']
  final int selectedRange;
  final String periodTitle; // "October spending"
  final double total;
  final double? changePercent;
  final List<BarDatum> bars;
  final int? highlightedBar;
  final List<SpendingCategory> categories;
  const SpendingData({
    required this.rangeLabels,
    required this.selectedRange,
    required this.periodTitle,
    required this.total,
    required this.bars,
    required this.categories,
    this.changePercent,
    this.highlightedBar,
  });

  SpendingData copyWith({int? selectedRange, int? highlightedBar}) => SpendingData(
        rangeLabels: rangeLabels,
        selectedRange: selectedRange ?? this.selectedRange,
        periodTitle: periodTitle,
        total: total,
        changePercent: changePercent,
        bars: bars,
        highlightedBar: highlightedBar ?? this.highlightedBar,
        categories: categories,
      );
}

/// One spending category over the period chosen on Spending (Spending → a category).
class SpendingCategoryDetailData {
  final String id;
  final String name;
  final String iconKey;
  /// e.g. "October spending" / "Aug–Oct spending" / "2026 spending".
  final String periodTitle;
  final double amount;
  /// % change from the period just before; null => nothing to compare with.
  final double? changePercent;
  /// This category's share of all spending in the period, 0..1.
  final double shareOfTotal;
  /// The same bars as on Spending (weeks or months), for this category only.
  final List<BarDatum> bars;
  final int? highlightedBar;
  final int transactionCount;
  /// null when there are no transactions.
  final double? averageAmount;
  final double? largestAmount;
  /// Newest first.
  final List<TransactionItem> transactions;
  const SpendingCategoryDetailData({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.periodTitle,
    required this.amount,
    required this.shareOfTotal,
    required this.bars,
    required this.transactionCount,
    required this.transactions,
    this.changePercent,
    this.highlightedBar,
    this.averageAmount,
    this.largestAmount,
  });

  SpendingCategoryDetailData copyWith({int? highlightedBar}) => SpendingCategoryDetailData(
        id: id,
        name: name,
        iconKey: iconKey,
        periodTitle: periodTitle,
        amount: amount,
        changePercent: changePercent,
        shareOfTotal: shareOfTotal,
        bars: bars,
        highlightedBar: highlightedBar ?? this.highlightedBar,
        transactionCount: transactionCount,
        averageAmount: averageAmount,
        largestAmount: largestAmount,
        transactions: transactions,
      );
}
