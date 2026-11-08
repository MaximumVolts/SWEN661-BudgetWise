import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * The phone's notifications (shown by the system, even when Pace is closed). No business rules:
 * what to send and when is decided by the services.
 */
export interface DeviceNotifications {
  /**
   * Whether Pace may show notifications. Asks the user the first time where the system requires it
   * (Android 13+, iOS); false when they said no or turned notifications off.
   */
  requestPermission(): Promise<boolean>;
  /** Shows a notification now. */
  show(n: { id: number; title: string; body: string }): Promise<void>;
  /** Shows a notification at [at] (local time), even if Pace isn't running then. */
  schedule(n: { id: number; title: string; body: string; at: Date }): Promise<void>;
  /** Cancels every scheduled notification. */
  cancelAll(): Promise<void>;
}

const CHANNEL_ID = 'bill_reminders';

/** [DeviceNotifications] through expo-notifications. */
export class ExpoDeviceNotifications implements DeviceNotifications {
  private ready?: Promise<void>;

  /** Set up on first use, so building the app's services never touches the native module. */
  private init() {
    return (this.ready ??= (async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Bill reminders',
          description: 'Reminders before your bills and subscriptions are due',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })());
  }

  async requestPermission() {
    await this.init();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  }

  async show(n: { id: number; title: string; body: string }) {
    await this.init();
    await Notifications.scheduleNotificationAsync({
      identifier: `pace-${n.id}`,
      content: { title: n.title, body: n.body },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
  }

  async schedule(n: { id: number; title: string; body: string; at: Date }) {
    await this.init();
    await Notifications.scheduleNotificationAsync({
      identifier: `pace-${n.id}`,
      content: { title: n.title, body: n.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.at, channelId: CHANNEL_ID },
    });
  }

  async cancelAll() {
    await this.init();
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

/** Records notifications instead of showing them (tests). */
export class InMemoryDeviceNotifications implements DeviceNotifications {
  constructor(public permitted = true) {}
  readonly shown: { id: number; title: string; body: string }[] = [];
  scheduled: { id: number; title: string; body: string; at: Date }[] = [];

  async requestPermission() {
    return this.permitted;
  }
  async show(n: { id: number; title: string; body: string }) {
    this.shown.push(n);
  }
  async schedule(n: { id: number; title: string; body: string; at: Date }) {
    this.scheduled = [...this.scheduled.filter((s) => s.id !== n.id), n];
  }
  async cancelAll() {
    this.scheduled = [];
  }
}
