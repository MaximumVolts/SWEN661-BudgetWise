import '../models/spending.dart' show SpendingCategoryDetailData;
import '../models/transaction.dart' show TransactionItem;
import 'app_navigator.dart' show AppNavigator;
import '../services/spending_service.dart' show SpendingService;
import 'base_controller.dart' show ScreenController;

/// One spending category over the period chosen on Spending ([rangeIndex]).
class SpendingCategoryController extends ScreenController {
  final SpendingService _service;
  final String categoryId;
  final int rangeIndex;
  SpendingCategoryController(
      {required this.categoryId, required this.rangeIndex, required SpendingService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  SpendingCategoryDetailData? data;

  @override
  Future<void> fetch() async => data = await _service.getCategoryDetail(categoryId: categoryId, rangeIndex: rangeIndex);

  void selectBar(int index) {
    data = data?.copyWith(highlightedBar: index);
    notifyListeners();
  }

  void openTransaction(TransactionItem t) => navigator.openTransaction(t.id);
}
