import { useGoalsController } from '../controllers/goalsController';
import { GoalsScreen } from './screens/GoalsScreen';

/** 13 - Savings goals: connects its controller to the screen. */
export function GoalsView() {
  return <GoalsScreen controller={useGoalsController()} />;
}
