import { useNotificationsController } from '../controllers/notificationsController';
import { NotificationsScreen } from './screens/NotificationsScreen';

/** 14 - Notifications: connects its controller to the screen. */
export function NotificationsView() {
  return <NotificationsScreen controller={useNotificationsController()} />;
}
