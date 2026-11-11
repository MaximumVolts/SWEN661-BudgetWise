import { useLocalSearchParams } from 'expo-router';
import { BillsView } from '../../BillsView';

/** Route for 11 / 12 - Bills; ?view=recurring opens the Recurring tab. */
export default function Route() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  return <BillsView view={view} />;
}
