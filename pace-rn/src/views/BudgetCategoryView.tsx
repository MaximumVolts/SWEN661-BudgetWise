import { useBudgetCategoryController } from '../controllers/budgetCategoryController';
import { BudgetCategoryScreen } from './screens/BudgetCategoryScreen';

/** 09 - Budget category detail: connects its controller to the screen. [periodId]: this month when absent. */
export function BudgetCategoryView({ id, periodId }: { id: string; periodId?: string }) {
  return <BudgetCategoryScreen controller={useBudgetCategoryController(id, periodId)} />;
}
