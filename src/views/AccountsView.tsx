import { useAccountsController } from '../controllers/accountsController';
import { AccountsScreen } from './screens/AccountsScreen';

/** 04 - Accounts: connects its controller to the screen. */
export function AccountsView() {
  return <AccountsScreen controller={useAccountsController()} />;
}
