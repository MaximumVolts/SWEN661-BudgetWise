import { useBillsController } from '../controllers/billsController';
import { BillsScreen } from './screens/BillsScreen';

/** 11 / 12 - Bills: connects its controller to the screen. [view]: 'recurring' shows the Recurring tab. */
export function BillsView({ view }: { view?: string }) {
  return <BillsScreen controller={useBillsController(view)} />;
}
