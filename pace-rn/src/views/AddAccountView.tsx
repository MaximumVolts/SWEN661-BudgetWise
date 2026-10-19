import { useAddAccountController } from '../controllers/addAccountController';
import { AddAccountScreen } from './screens/AddAccountScreen';

/** Accounts → Add an account: connects its controller to the screen. */
export function AddAccountView() {
  return <AddAccountScreen controller={useAddAccountController()} />;
}
