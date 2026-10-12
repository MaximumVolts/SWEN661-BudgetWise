/// Bills and recurring subscriptions.
library;

enum SubscriptionStatus { active, paused }

class BillItem {
  final String id;
  final String title;
  final String subtitle;
  final double amount;
  final String iconKey;
  final bool isOverdue;
  const BillItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.iconKey,
    this.isOverdue = false,
  });
}

class BillSection {
  final String title;
  final List<BillItem> items;
  const BillSection({required this.title, required this.items});
}

class BillsUpcomingData {
  final String summaryLabel;
  final double summaryAmount;
  final String summaryDetail;
  final List<BillSection> sections;
  const BillsUpcomingData({
    required this.summaryLabel,
    required this.summaryAmount,
    required this.summaryDetail,
    required this.sections,
  });
}

class RecurringItem {
  final String id;
  final String name;
  final String iconKey;
  final String detailLine; // "$2.99 monthly · next Oct 29"
  final String yearlyLine; // "$35.88 a year"
  final SubscriptionStatus status;
  const RecurringItem({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.detailLine,
    required this.yearlyLine,
    required this.status,
  });
}

class RecurringData {
  final double monthlyTotal;
  final double yearlyTotal;
  final List<RecurringItem> items;
  final String? insight;
  const RecurringData({required this.monthlyTotal, required this.yearlyTotal, required this.items, this.insight});
}
