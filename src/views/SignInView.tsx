import { useSignInController } from '../controllers/signInController';
import { SignInScreen } from './screens/SignInScreen';

/** 01 - Sign In: connects its controller to the screen. */
export function SignInView() {
  return <SignInScreen controller={useSignInController()} />;
}
