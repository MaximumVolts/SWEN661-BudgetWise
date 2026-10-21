import { useDashboardController } from '../controllers/dashboardController';
import { DashboardScreen } from './screens/DashboardScreen';

/** 05 - Dashboard (Home): connects its controller to the screen. */
export function DashboardView() {
  return <DashboardScreen controller={useDashboardController()} />;
}
