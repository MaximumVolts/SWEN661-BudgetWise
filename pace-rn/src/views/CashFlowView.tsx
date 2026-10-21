import { useCashFlowController } from '../controllers/cashFlowController';
import { CashFlowScreen } from './screens/CashFlowScreen';

/** 16 - Cash flow projection: connects its controller to the screen. */
export function CashFlowView() {
  return <CashFlowScreen controller={useCashFlowController()} />;
}
