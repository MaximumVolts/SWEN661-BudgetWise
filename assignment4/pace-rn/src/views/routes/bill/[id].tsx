import { useLocalSearchParams } from 'expo-router';
import { BillDetailView } from '../../BillDetailView';

/** Route for one bill or subscription. */
export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BillDetailView id={id} />;
}
