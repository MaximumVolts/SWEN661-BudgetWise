import { useLocalSearchParams } from 'expo-router';
import { TransactionDetailView } from '../../TransactionDetailView';

/** Route for 07 - Transaction detail. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TransactionDetailView id={id} />;
}
