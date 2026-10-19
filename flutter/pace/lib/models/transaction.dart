/// Transactions: list items, detail, categories and list filters.
library;

class CategoryInfo {
  final String id;
  final String name;
  final String iconKey;
  const CategoryInfo({required this.id, required this.name, required this.iconKey});
}

/// Negative [amount] = money out, positive = money in (income).
class TransactionItem {
  final String id;
  final String title;
  final String subtitle;
  final double amount;
  final String iconKey;
  /// Lime icon background (e.g. income).
  final bool highlight;
  const TransactionItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.iconKey,
    this.highlight = false,
  });
}

class TransactionGroup {
  final String dayLabel;
  final double total;
  final List<TransactionItem> items;
  const TransactionGroup({required this.dayLabel, required this.total, required this.items});
}

class TransactionDetailData {
  final String id;
  final String title;
  final String iconKey;
  final double amount;
  final String dateLabel;
  final String accountLabel;
  final String statusLabel;
  final String merchantLabel;
  /// The transaction's categories in order. The first is primary: its full amount counts there in
  /// spending, budgets and trends; the rest are labels for display and filtering.
  final List<String> selectedCategoryIds;
  const TransactionDetailData({
    required this.id,
    required this.title,
    required this.iconKey,
    required this.amount,
    required this.dateLabel,
    required this.accountLabel,
    required this.statusLabel,
    required this.merchantLabel,
    this.selectedCategoryIds = const [],
  });
}

class TransactionDetailBundle {
  final TransactionDetailData transaction;
  final List<CategoryInfo> categories;
  const TransactionDetailBundle({required this.transaction, required this.categories});
}

enum FilterKind { account, category, date }

class FilterChoice {
  final String id;
  final String label;
  const FilterChoice({required this.id, required this.label});
}

/// Filters applied to the transactions list. null = no filter ("All").
class TransactionQuery {
  final FilterChoice? account;
  final FilterChoice? category;
  final FilterChoice? date;
  /// What the user typed in the search field ('' = no search).
  final String search;
  const TransactionQuery({this.account, this.category, this.date, this.search = ''});

  TransactionQuery withFilter(FilterKind kind, FilterChoice? choice) => switch (kind) {
        FilterKind.account => TransactionQuery(account: choice, category: category, date: date, search: search),
        FilterKind.category => TransactionQuery(account: account, category: choice, date: date, search: search),
        FilterKind.date => TransactionQuery(account: account, category: category, date: choice, search: search),
      };

  TransactionQuery withSearch(String text) => TransactionQuery(account: account, category: category, date: date, search: text);
}
