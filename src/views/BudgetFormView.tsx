import { useBudgetFormController } from '../controllers/budgetFormController';
import { BudgetFormScreen } from './screens/BudgetFormScreen';

/** Create a budget, or edit / delete the one for category [id]: connects its controller to the screen. */
export function BudgetFormView({ id }: { id?: string }) {
  return <BudgetFormScreen controller={useBudgetFormController(id)} />;
}
