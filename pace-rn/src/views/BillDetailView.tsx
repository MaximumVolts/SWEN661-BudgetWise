import { useBillDetailController } from '../controllers/billDetailController';
import { BillDetailScreen } from './screens/BillDetailScreen';

/** One bill or subscription: connects its controller to the screen. */
export function BillDetailView({ id }: { id: string }) {
  return <BillDetailScreen controller={useBillDetailController(id)} />;
}
