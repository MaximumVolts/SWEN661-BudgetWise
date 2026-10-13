import '../models/transaction.dart' show CategoryInfo, TransactionDetailBundle;
import 'app_navigator.dart' show AppNavigator;
import '../services/transaction_service.dart' show TransactionService;
import 'base_controller.dart' show ScreenController;

class TransactionDetailController extends ScreenController {
  final TransactionService _service;
  final String transactionId;
  TransactionDetailController({required this.transactionId, required TransactionService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  TransactionDetailBundle? bundle;
  /// The transaction's categories in order; the first is primary (counts toward totals).
  List<String> selectedCategoryIds = const [];

  @override
  Future<void> fetch() async {
    bundle = await _service.getDetail(transactionId);
    selectedCategoryIds = bundle!.transaction.selectedCategoryIds;
  }

  /// Adds [c], or removes it if already chosen. The last category can't be removed (a transaction
  /// always has one). Removing the primary makes the next one primary. Optimistic; reverts on failure.
  Future<void> toggleCategory(CategoryInfo c) async {
    final previous = selectedCategoryIds;
    final next = previous.contains(c.id) ? [for (final id in previous) if (id != c.id) id] : [...previous, c.id];
    if (next.isEmpty) return;
    selectedCategoryIds = next;
    notifyListeners();
    final ok = await perform(() => _service.setCategories(transactionId: transactionId, categoryIds: next));
    if (!ok) {
      selectedCategoryIds = previous;
      notifyListeners();
    }
  }

  Future<void> newCategory() => refreshIf(navigator.openNewCategory());

  Future<void> addNote() => refreshIf(navigator.openAddNote(transactionId));

}
