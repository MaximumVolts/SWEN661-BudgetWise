/// Notification center.
library;

enum NotificationKind { overdue, overBudget, nearLimit, reminder }

class NotificationItem {
  final String id;
  final NotificationKind kind;
  final bool isNew;
  final String metaLabel; // "Bill overdue · 2h ago"
  final String title;
  final String body;
  /// If set, shows filled / outlined action buttons under the message.
  final String? primaryActionLabel;
  final String? secondaryActionLabel;
  const NotificationItem({
    required this.id,
    required this.kind,
    required this.title,
    required this.body,
    required this.metaLabel,
    this.isNew = false,
    this.primaryActionLabel,
    this.secondaryActionLabel,
  });
}

class SyncStatus {
  final String label;
  final double progress; // 0..1
  const SyncStatus({required this.label, required this.progress});
}

class NotificationsData {
  final List<String> filterLabels;
  final int selectedFilter;
  final List<NotificationItem> items;
  final SyncStatus? sync;
  const NotificationsData({
    required this.filterLabels,
    required this.selectedFilter,
    required this.items,
    this.sync,
  });

  NotificationsData copyWith({int? selectedFilter, List<NotificationItem>? items, SyncStatus? sync}) => NotificationsData(
        filterLabels: filterLabels,
        selectedFilter: selectedFilter ?? this.selectedFilter,
        items: items ?? this.items,
        sync: sync ?? this.sync,
      );
}
