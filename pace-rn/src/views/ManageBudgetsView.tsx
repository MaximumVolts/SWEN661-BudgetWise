import { useManageBudgetsController } from '../controllers/manageBudgetsController';
import { ManageBudgetsScreen } from './screens/ManageBudgetsScreen';

/** Budgets manager: connects its controller to the screen. */
export function ManageBudgetsView() {
  return <ManageBudgetsScreen controller={useManageBudgetsController()} />;
}
