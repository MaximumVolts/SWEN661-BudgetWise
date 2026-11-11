import { useLocalSearchParams } from 'expo-router';
import { TransactionsView } from '../../TransactionsView';

/**
 * Route for 06 - Transactions; ?category= starts filtered to that category and ?q= with that
 * search (a new category or search starts afresh).
 */
export default function Route() {
  const { category, q } = useLocalSearchParams<{ category?: string; q?: string }>();
  return <TransactionsView key={`${category ?? ''}|${q ?? ''}`} category={category} search={q} />;
}
