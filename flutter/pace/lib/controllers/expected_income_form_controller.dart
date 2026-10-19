import '../services/cash_flow_service.dart' show CashFlowService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// Cash flow → Add expected income. UI state only: what's valid lives in [CashFlowService]. Field
/// errors: 'name', 'amount', 'date'.
class ExpectedIncomeFormController extends FormController {
  final CashFlowService _service;
  ExpectedIncomeFormController({required CashFlowService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  DateTime? date;

  void selectDate(DateTime d) {
    date = d;
    fieldErrors = {...fieldErrors}..remove('date');
    notifyListeners();
  }

  /// Saves and goes back to the projection on success; shows field errors otherwise.
  Future<void> save({required String name, required String amount}) async {
    if (await submit(() => _service.addExpectedIncome(name: name, amount: amount, date: date))) navigator.back();
  }
}
