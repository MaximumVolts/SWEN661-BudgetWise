import { useSettingsController } from '../controllers/settingsController';
import { SettingsScreen } from './screens/SettingsScreen';

/** 15 - Settings: connects its controller to the screen. */
export function SettingsView() {
  return <SettingsScreen controller={useSettingsController()} />;
}
