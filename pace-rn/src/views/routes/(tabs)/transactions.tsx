import { useLocalSearchParams } from 'expo-router';
import { TransactionsView } from '../../TransactionsView';

/** Route for 06 - Transactions; ?category= starts filtered to that category (a new category starts a fresh search). */
export default function Route() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  return <TransactionsView key={category ?? ''} category={category} />;
}
