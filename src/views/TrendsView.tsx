import { useTrendsController } from '../controllers/trendsController';
import { TrendsScreen } from './screens/TrendsScreen';

/** 17 - Trends: connects its controller to the screen. */
export function TrendsView() {
  return <TrendsScreen controller={useTrendsController()} />;
}
