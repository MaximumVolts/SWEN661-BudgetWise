import '../models/transaction.dart' show FilterChoice, FilterKind, TransactionGroup, TransactionItem, TransactionQuery;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/transaction_service.dart' show TransactionService;
import 'base_controller.dart' show ScreenController;

class TransactionsController extends ScreenController {
  final TransactionService _service;
  TransactionsController({required TransactionService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  List<TransactionGroup> groups = const [];
  TransactionQuery query = const TransactionQuery();

  String get accountLabel => query.account?.label ?? 'All accounts';
  String get categoryLabel => query.category?.label ?? 'Category';
  String get dateLabel => query.date?.label ?? 'Date';

  @override
  Future<void> fetch() async => groups = await _service.getGroups(query);

  Future<void> pickFilter(FilterKind kind) async {
    List<FilterChoice> choices = const [];
    if (!await perform(() async => choices = await _service.getFilterChoices(kind))) return;
    final current = switch (kind) {
      FilterKind.account => query.account,
      FilterKind.category => query.category,
      FilterKind.date => query.date,
    };
    final picked = await navigator.pickFilter(kind, choices: choices, current: current);
    if (picked == null) return;
    query = query.withFilter(kind, picked.id.isEmpty ? null : picked);
    notifyListeners();
    await refresh();
  }

  void openTransaction(TransactionItem t) => navigator.openTransaction(t.id);
  void headerAction() => navigator.openMenu('transactions');
}
