import '../models/navigation.dart' show DeepLinkTarget;
import '../models/notification.dart' show NotificationItem, NotificationsData;
import 'app_navigator.dart' show AppNavigator;
import '../services/notification_service.dart' show NotificationService;
import 'base_controller.dart' show ScreenController;

class NotificationsController extends ScreenController {
  final NotificationService _service;
  NotificationsController({required NotificationService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  NotificationsData? data;
  int filterIndex = 0;

  @override
  Future<void> fetch() async => data = await _service.getNotifications(filterIndex: filterIndex);

  Future<void> selectFilter(int index) async {
    if (index == filterIndex) return;
    filterIndex = index;
    data = data?.copyWith(selectedFilter: index);
    notifyListeners();
    await refresh();
  }

  Future<void> markAllRead() => performAndRefresh(_service.markAllRead);

  Future<void> runPrimaryAction(NotificationItem n) => performAndRefresh(() => _service.runPrimaryAction(n.id));

  /// Secondary action and plain taps: the service marks it read and says where it leads.
  Future<void> openTarget(NotificationItem n) async {
    DeepLinkTarget? target;
    if (!await perform(() async => target = await _service.open(n.id))) return;
    final t = target;
    if (t == null) return;
    navigator.back(); // close the notification center, then go to the target
    navigator.openTarget(t);
  }

  void close() => navigator.back();
}
