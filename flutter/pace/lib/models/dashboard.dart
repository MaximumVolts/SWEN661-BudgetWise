/// Home dashboard.
library;

import 'bill.dart' show BillItem;
import 'budget.dart' show BudgetCategory, BudgetSummary;
import 'transaction.dart' show TransactionItem;
import 'trend.dart' show TrendItem;

enum AccountTone { neutral, alert, accent }

class DashboardAccount {
  final String id;
  final String name;
  final String iconKey;
  final double balance;
  final String? subtitle;
  final AccountTone tone;
  final bool hasInfo;
  const DashboardAccount({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.balance,
    this.subtitle,
    this.tone = AccountTone.neutral,
    this.hasInfo = false,
  });
}

class SpendChartData {
  /// Spend so far this period, in order (solid line + lime area).
  final List<double> actual;
  /// Projected continuation after the last [actual] point (dashed line).
  final List<double> projected;
  /// Previous period for comparison (optional, light line).
  final List<double> previous;
  const SpendChartData({required this.actual, this.projected = const [], this.previous = const []});
}

class SpendSummary {
  final String title; // "Cannot spend this month"
  final double amount;
  final double? deltaAmount; // absolute difference vs previous period
  final bool deltaIsAbove;
  final String? deltaPeriodLabel; // "Sep 1–18"
  final SpendChartData chart;
  final String currentLegend; // "October"
  final String? previousLegend; // "September"
  const SpendSummary({
    required this.title,
    required this.amount,
    required this.chart,
    this.deltaAmount,
    this.deltaIsAbove = true,
    this.deltaPeriodLabel,
    this.currentLegend = '',
    this.previousLegend,
  });
}

class ReviewBanner {
  final String title;
  final String subtitle;
  const ReviewBanner({required this.title, required this.subtitle});
}

class ToolLink {
  final String id;
  final String iconKey;
  final String title;
  final String subtitle;
  final bool accent;
  const ToolLink({required this.id, required this.iconKey, required this.title, required this.subtitle, this.accent = false});
}

class DashboardData {
  final String dateLabel;
  final bool hasUnreadNotifications;
  final ReviewBanner? reviewBanner;
  final SpendSummary spend;
  final String? paydayLabel;
  final List<DashboardAccount> accounts;
  final String? lastSyncLabel;
  final List<TransactionItem> recentTransactions;
  final BudgetSummary? budget;
  final List<BudgetCategory> budgetCategories;
  final List<BillItem> upcomingBills;
  final TrendItem? featuredTrend;
  final String? featuredTrendSource;
  final List<ToolLink> tools;
  const DashboardData({
    required this.dateLabel,
    required this.spend,
    this.hasUnreadNotifications = false,
    this.reviewBanner,
    this.paydayLabel,
    this.accounts = const [],
    this.lastSyncLabel,
    this.recentTransactions = const [],
    this.budget,
    this.budgetCategories = const [],
    this.upcomingBills = const [],
    this.featuredTrend,
    this.featuredTrendSource,
    this.tools = const [],
  });
}
