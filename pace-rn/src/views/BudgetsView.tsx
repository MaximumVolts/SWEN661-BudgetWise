import { useBudgetsController } from '../controllers/budgetsController';
import { BudgetsScreen } from './screens/BudgetsScreen';

/** 08 - Budgets: connects its controller to the screen. */
export function BudgetsView() {
  return <BudgetsScreen controller={useBudgetsController()} />;
}
