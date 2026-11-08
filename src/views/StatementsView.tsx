import { useStatementsController } from '../controllers/statementsController';
import { StatementsScreen } from './screens/StatementsScreen';

/** Statement export: connects its controller to the screen. */
export function StatementsView() {
  return <StatementsScreen controller={useStatementsController()} />;
}
