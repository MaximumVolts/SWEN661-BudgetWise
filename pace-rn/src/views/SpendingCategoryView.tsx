import { useSpendingCategoryController } from '../controllers/spendingCategoryController';
import { SpendingCategoryScreen } from './screens/SpendingCategoryScreen';

/** 10b - Spending by category: connects its controller to the screen. [rangeIndex]: the period Spending showed. */
export function SpendingCategoryView({ id, rangeIndex }: { id: string; rangeIndex: number }) {
  return <SpendingCategoryScreen controller={useSpendingCategoryController(id, rangeIndex)} />;
}
