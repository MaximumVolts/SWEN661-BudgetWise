import { useBillFormController } from '../controllers/billFormController';
import { BillFormScreen } from './screens/BillFormScreen';

/** Add a recurring expense, or edit [id]: connects its controller to the screen. */
export function BillFormView({ id }: { id?: string }) {
  return <BillFormScreen controller={useBillFormController(id)} />;
}
