import { useSpendingController } from '../controllers/spendingController';
import { SpendingScreen } from './screens/SpendingScreen';

/** 10 - Spending: connects its controller to the screen. */
export function SpendingView() {
  return <SpendingScreen controller={useSpendingController()} />;
}
