import { useComparisonController } from '../controllers/comparisonController';
import { ComparisonScreen } from './screens/ComparisonScreen';

/** Monthly Comparison: connects its controller to the screen. */
export function ComparisonView() {
  return <ComparisonScreen controller={useComparisonController()} />;
}
