import { useGoalFormController } from '../controllers/goalFormController';
import { GoalFormScreen } from './screens/GoalFormScreen';

/** Savings goals → New goal: connects its controller to the screen. */
export function GoalFormView() {
  return <GoalFormScreen controller={useGoalFormController()} />;
}
