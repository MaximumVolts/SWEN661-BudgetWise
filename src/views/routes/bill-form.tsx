import { useLocalSearchParams } from 'expo-router';
import { BillFormView } from '../BillFormView';

/** Route for adding a recurring expense, or editing ?id=. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <BillFormView id={id} />;
}
