import { useExpectedIncomeFormController } from '../controllers/expectedIncomeFormController';
import { ExpectedIncomeFormScreen } from './screens/ExpectedIncomeFormScreen';

/** Cash flow → Add expected income: connects its controller to the screen. */
export function ExpectedIncomeFormView() {
  return <ExpectedIncomeFormScreen controller={useExpectedIncomeFormController()} />;
}
