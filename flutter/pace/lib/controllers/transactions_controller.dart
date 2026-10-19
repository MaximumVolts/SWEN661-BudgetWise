import 'dart:async' show Timer;
import '../models/transaction.dart' show FilterChoice, FilterKind, TransactionGroup, TransactionItem, TransactionQuery;
import 'app_navigator.dart' show AppNavigator;
import '../services/transaction_service.dart' show TransactionService;
import 'base_controller.dart' show ScreenController;

class TransactionsController extends ScreenController {
  /// How long typing has to pause before the search runs.
  static const searchDelay = Duration(milliseconds: 300);

  final TransactionService _service;
  TransactionsController({required TransactionService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  List<TransactionGroup> groups = const [];
  TransactionQuery query = const TransactionQuery();
  Timer? _searchTimer;

  String get accountLabel => query.account?.label ?? 'All accounts';
  String get categoryLabel => query.category?.label ?? 'Category';
  String get dateLabel => query.date?.label ?? 'Date';
  bool get isSearching => query.search.trim().isNotEmpty;
  String get emptyMessage =>
      isSearching ? 'No transactions match "${query.search.trim()}".' : 'No transactions to show.';

  @override
  Future<void> fetch() async {
    final asked = query;
    final result = await _service.getGroups(asked);
    // The search may have changed while this ran; the newer search updates the list.
    if (identical(asked, query)) groups = result;
  }

  /// Called as the user types: searches once they pause for [searchDelay].
  void search(String text) {
    if (text == query.search) return;
    query = query.withSearch(text);
    _searchTimer?.cancel();
    _searchTimer = Timer(searchDelay, refresh);
  }

  /// The search field's clear button: show everything again right away.
  Future<void> clearSearch() async {
    _searchTimer?.cancel();
    if (query.search.isEmpty) return;
    query = query.withSearch('');
    notifyListeners();
    await refresh();
  }

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

  @override
  void dispose() {
    _searchTimer?.cancel();
    super.dispose();
  }
}
