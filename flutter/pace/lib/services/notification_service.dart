import '../models/navigation.dart' show DeepLinkTarget;
import '../models/notification.dart' show NotificationsData;

/// BUSINESS RULES: which events create notifications (overdue, over budget, near limit, reminders),
/// "new" vs read, filter semantics, and what each notification points at.
abstract class NotificationService {
  /// [filterIndex] indexes NotificationsData.filterLabels (All / Bills / Budgets / Goals).
  Future<NotificationsData> getNotifications({required int filterIndex});
  Future<void> markAllRead();
  /// Runs the primary inline action of a notification (e.g. "Mark as paid").
  Future<void> runPrimaryAction(String notificationId);
  /// The user opened a notification: marks it read and returns where it leads (null = nowhere).
  Future<DeepLinkTarget?> open(String notificationId);
}
