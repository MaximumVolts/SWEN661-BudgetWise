import { useLocalSearchParams } from 'expo-router';
import { SpendingCategoryView } from '../../SpendingCategoryView';

/** Route for 10b - Spending by category; ?range= is the period Spending was showing (0 Month, 1 3 months, 2 Year). */
export default function Route() {
  const { id, range } = useLocalSearchParams<{ id: string; range?: string }>();
  return <SpendingCategoryView id={id} rangeIndex={Number(range ?? 0) || 0} />;
}
