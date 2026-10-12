import '../models/transaction.dart' show CategoryInfo, TransactionDetailBundle;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/transaction_service.dart' show TransactionService;
import 'base_controller.dart' show ScreenController;

class TransactionDetailController extends ScreenController {
  final TransactionService _service;
  final String transactionId;
  TransactionDetailController({required this.transactionId, required TransactionService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  TransactionDetailBundle? bundle;
  String? selectedCategoryId;

  @override
  Future<void> fetch() async {
    bundle = await _service.getDetail(transactionId);
    selectedCategoryId = bundle!.transaction.selectedCategoryId;
  }

  /// Optimistic update; reverts if the service fails.
  Future<void> selectCategory(CategoryInfo c) async {
    final previous = selectedCategoryId;
    selectedCategoryId = c.id;
    notifyListeners();
    final ok = await perform(() => _service.setCategory(transactionId: transactionId, categoryId: c.id));
    if (!ok) {
      selectedCategoryId = previous;
      notifyListeners();
    }
  }

  Future<void> newCategory() async {
    if (await navigator.openNewCategory()) await refresh();
  }

  Future<void> addNote() async {
    if (await navigator.openAddNote(transactionId)) await refresh();
  }

  void openMenu() => navigator.openMenu('transaction_detail');
}
