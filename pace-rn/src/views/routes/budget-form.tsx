import { useLocalSearchParams } from 'expo-router';
import { BudgetFormView } from '../BudgetFormView';

/** Route for creating a budget, or editing / deleting the one for category ?id=. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <BudgetFormView id={id} />;
}
