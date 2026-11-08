import { useLocalSearchParams } from 'expo-router';
import { BudgetCategoryView } from '../../BudgetCategoryView';

/** Route for 09 - Budget category detail; ?period= is the budget period (this month when absent). */
export default function Route() {
  const { id, period } = useLocalSearchParams<{ id: string; period?: string }>();
  return <BudgetCategoryView id={id} periodId={period} />;
}
