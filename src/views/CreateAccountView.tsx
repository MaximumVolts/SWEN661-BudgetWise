import { useCreateAccountController } from '../controllers/createAccountController';
import { CreateAccountScreen } from './screens/CreateAccountScreen';

/** 01b - Create Account: connects its controller to the screen. */
export function CreateAccountView() {
  return <CreateAccountScreen controller={useCreateAccountController()} />;
}
