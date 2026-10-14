import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;
import 'package:flutter_local_notifications/flutter_local_notifications.dart'
    show
        AndroidFlutterLocalNotificationsPlugin,
        AndroidInitializationSettings,
        AndroidNotificationDetails,
        AndroidScheduleMode,
        DarwinInitializationSettings,
        DarwinNotificationDetails,
        FlutterLocalNotificationsPlugin,
        Importance,
        InitializationSettings,
        NotificationDetails,
        Priority;
import 'package:timezone/timezone.dart' as tz show TZDateTime, UTC;

/// The phone's notifications (push notifications shown by the system, even when Pace is closed).
/// No business rules: what to send and when is decided by the services.
abstract class DeviceNotifications {
  /// Whether Pace may show notifications. Asks the user the first time where the system requires
  /// it (Android 13+); false when they said no or turned notifications off.
  Future<bool> requestPermission();

  /// Shows a notification now.
  Future<void> show({required int id, required String title, required String body});

  /// Shows a notification at [at] (local time), even if Pace isn't running then.
  Future<void> schedule({required int id, required String title, required String body, required DateTime at});

  /// Cancels every scheduled notification.
  Future<void> cancelAll();
}

/// [DeviceNotifications] through flutter_local_notifications. Scheduled reminders are inexact
/// (Android may deliver them a few minutes late to save battery), which avoids the exact-alarm
/// permission.
class LocalDeviceNotifications implements DeviceNotifications {
  static const _channelId = 'bill_reminders';
  static const _details = NotificationDetails(
    android: AndroidNotificationDetails(
      _channelId,
      'Bill reminders',
      channelDescription: 'Reminders before your bills and subscriptions are due',
      importance: Importance.high,
      priority: Priority.high,
    ),
    iOS: DarwinNotificationDetails(),
  );

  final _plugin = FlutterLocalNotificationsPlugin();
  Future<void>? _ready;

  /// Initialised on first use, so building the app's services never touches the plugin.
  Future<void> _init() => _ready ??= _plugin.initialize(
        settings: const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
          iOS: DarwinInitializationSettings(
              requestAlertPermission: false, requestBadgePermission: false, requestSoundPermission: false),
        ),
      );

  AndroidFlutterLocalNotificationsPlugin? get _android =>
      _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

  @override
  Future<bool> requestPermission() async {
    await _init();
    if (defaultTargetPlatform != TargetPlatform.android) return true;
    final android = _android;
    if (android == null) return false;
    if (await android.areNotificationsEnabled() ?? false) return true;
    return await android.requestNotificationsPermission() ?? false;
  }

  @override
  Future<void> show({required int id, required String title, required String body}) async {
    await _init();
    await _plugin.show(id: id, title: title, body: body, notificationDetails: _details);
  }

  @override
  Future<void> schedule({required int id, required String title, required String body, required DateTime at}) async {
    await _init();
    await _plugin.zonedSchedule(
      id: id,
      title: title,
      body: body,
      // The same instant in UTC, so no time-zone database is needed on the device.
      scheduledDate: tz.TZDateTime.from(at.toUtc(), tz.UTC),
      notificationDetails: _details,
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
    );
  }

  @override
  Future<void> cancelAll() async {
    await _init();
    await _plugin.cancelAll();
  }
}

/// Records notifications instead of showing them: for tests, and where there are none.
class InMemoryDeviceNotifications implements DeviceNotifications {
  /// What [requestPermission] answers.
  bool permitted;
  InMemoryDeviceNotifications({this.permitted = true});

  final shown = <({int id, String title, String body})>[];
  final scheduled = <({int id, String title, String body, DateTime at})>[];

  @override
  Future<bool> requestPermission() async => permitted;

  @override
  Future<void> show({required int id, required String title, required String body}) async =>
      shown.add((id: id, title: title, body: body));

  @override
  Future<void> schedule({required int id, required String title, required String body, required DateTime at}) async {
    scheduled
      ..removeWhere((n) => n.id == id)
      ..add((id: id, title: title, body: body, at: at));
  }

  @override
  Future<void> cancelAll() async => scheduled.clear();
}
