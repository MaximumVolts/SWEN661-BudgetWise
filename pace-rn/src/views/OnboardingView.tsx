import { useOnboardingController } from '../controllers/onboardingController';
import { OnboardingScreen } from './screens/OnboardingScreen';

/** 02 - Onboarding priorities: connects its controller to the screen. */
export function OnboardingView() {
  return <OnboardingScreen controller={useOnboardingController()} />;
}
