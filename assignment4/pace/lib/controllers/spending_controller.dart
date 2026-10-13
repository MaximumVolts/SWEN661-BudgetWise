import '../models/spending.dart' show SpendingCategory, SpendingData;
import 'app_navigator.dart' show AppNavigator;
import '../services/spending_service.dart' show SpendingService;
import 'base_controller.dart' show ScreenController;

class SpendingController extends ScreenController {
  final SpendingService _service;
  SpendingController({required SpendingService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  SpendingData? data;
  int rangeIndex = 0;

  @override
  Future<void> fetch() async => data = await _service.getSpending(rangeIndex: rangeIndex);

  Future<void> selectRange(int index) async {
    if (index == rangeIndex) return;
    rangeIndex = index;
    data = data?.copyWith(selectedRange: index);
    notifyListeners();
    await refresh();
  }

  void selectBar(int index) {
    data = data?.copyWith(highlightedBar: index);
    notifyListeners();
  }

  void openCategory(SpendingCategory c) => navigator.openSpendingCategory(c.id);
  void openCalendar() => navigator.openMenu('spending_calendar');
}
