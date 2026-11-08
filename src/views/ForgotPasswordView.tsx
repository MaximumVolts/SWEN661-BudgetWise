import { useForgotPasswordController } from '../controllers/forgotPasswordController';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';

/** 01c - Reset Password: connects its controller to the screen. */
export function ForgotPasswordView() {
  return <ForgotPasswordScreen controller={useForgotPasswordController()} />;
}
