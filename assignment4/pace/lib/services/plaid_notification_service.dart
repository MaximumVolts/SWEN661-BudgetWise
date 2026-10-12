import '../models/budget.dart' show BudgetStatus;
import '../models/navigation.dart' show DeepLinkTarget, TargetKind;
import '../models/notification.dart' show NotificationItem, NotificationKind, NotificationsData;
import 'calendar.dart' show Calendar;
import '../models/money.dart' show Money;
import 'notification_service.dart' show NotificationService;
import 'bill_service.dart' show BillService;
import 'budget_service.dart' show BudgetService;

/// [NotificationService] raising alerts from the linked banks' data in Plaid (sandbox).
/// BUSINESS RULES: overdue bills; bills due within 3 days; this month's budgets that are over or
/// near their limit (as BudgetService rates them). "Read" state is kept for this session.
class PlaidNotificationService implements NotificationService {
  static const _filters = ['Bills', 'Budgets', 'Goals'];

  final BillService _bills;
  final BudgetService _budgets;
  final DateTime Function() _now;
  final _read = <String>{};
  PlaidNotificationService(this._bills, this._budgets, {DateTime Function()? now}) : _now = now ?? DateTime.now;

  Future<List<NotificationItem>> _all() async {
    final today = Calendar.dateOnly(_now());
    final items = <NotificationItem>[];
    for (final (:bill, :due) in await _bills.upcomingWithDates()) {
      final days = Calendar.daysBetween(today, due);
      if (bill.isOverdue) {
        items.add(NotificationItem(
          id: 'overdue-${bill.id}',
          kind: NotificationKind.overdue,
          isNew: !_read.contains('overdue-${bill.id}'),
          metaLabel: 'Bill overdue',
          title: '${bill.title} is overdue',
          body: '${Money.format(bill.amount)} · ${bill.subtitle}.',
          primaryActionLabel: 'Mark as paid',
          secondaryActionLabel: 'View bill',
        ));
      } else if (days <= 3) {
        items.add(NotificationItem(
          id: 'reminder-${bill.id}',
          kind: NotificationKind.reminder,
          isNew: !_read.contains('reminder-${bill.id}'),
          metaLabel: 'Bill reminder',
          title: '${bill.title} is due ${days == 0 ? 'today' : 'in $days day${days == 1 ? '' : 's'}'}',
          body: '${Money.format(bill.amount)} · ${bill.subtitle}.',
        ));
      }
    }
    // This month's budgets; whether one is over / near its limit is the budget service's rule.
    for (final c in (await _budgets.getOverview('')).categories) {
      if (c.status == BudgetStatus.over) {
        items.add(NotificationItem(
          id: 'over-${c.id}',
          kind: NotificationKind.overBudget,
          isNew: !_read.contains('over-${c.id}'),
          metaLabel: BudgetStatus.over.label,
          title: '${c.name} is ${Money.format(-c.remaining)} over',
          body: "You've spent ${Money.format(c.spent)} of your ${Money.format(c.limit, decimals: 0)} limit.",
        ));
      } else if (c.status == BudgetStatus.nearLimit) {
        items.add(NotificationItem(
          id: 'near-${c.id}',
          kind: NotificationKind.nearLimit,
          isNew: !_read.contains('near-${c.id}'),
          metaLabel: BudgetStatus.nearLimit.label,
          title: '${c.name} is near its limit',
          body: '${Money.format(c.remaining)} left this month.',
        ));
      }
    }
    return items;
  }

  @override
  Future<NotificationsData> getNotifications({required int filterIndex}) async {
    final all = await _all();
    final unread = all.where((n) => n.isNew).length;
    return NotificationsData(
      filterLabels: ['All · $unread new', ..._filters],
      selectedFilter: filterIndex,
      items: switch (filterIndex) {
        1 => all.where((n) => n.kind == NotificationKind.overdue || n.kind == NotificationKind.reminder).toList(),
        2 => all.where((n) => n.kind == NotificationKind.overBudget || n.kind == NotificationKind.nearLimit).toList(),
        3 => const [],
        _ => all,
      },
    );
  }

  @override
  Future<void> markAllRead() async => _read.addAll([for (final n in await _all()) n.id]);

  /// "Mark as paid" on an overdue bill.
  @override
  Future<void> runPrimaryAction(String notificationId) async {
    if (notificationId.startsWith('overdue-')) {
      await _bills.markPaid(notificationId.substring('overdue-'.length));
    }
    _read.add(notificationId);
  }

  @override
  Future<DeepLinkTarget?> open(String notificationId) async {
    _read.add(notificationId);
    final dash = notificationId.indexOf('-');
    final kind = notificationId.substring(0, dash), id = notificationId.substring(dash + 1);
    return switch (kind) {
      'overdue' || 'reminder' => const DeepLinkTarget(TargetKind.bills),
      'over' || 'near' => DeepLinkTarget(TargetKind.budgetCategory, id),
      _ => null,
    };
  }
}
