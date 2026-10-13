import '../models/statement.dart' show Statement, StatementChoice, StatementFormat, StatementOptions;
import '../services/statement_service.dart' show StatementService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;

/// Statement export: pick an account, a month and a format, see what the statement will contain,
/// download it. UI state only; what a statement includes lives in [StatementService].
class StatementExportController extends ScreenController {
  final StatementService _service;
  StatementExportController({required StatementService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  StatementOptions options = const StatementOptions(accounts: [], months: []);
  int selectedAccount = 0;
  int selectedMonth = 0;
  StatementFormat format = StatementFormat.pdf;
  /// The statement for the current choices (what the download will contain).
  Statement? preview;
  bool isDownloading = false;

  StatementChoice? get _account => selectedAccount < options.accounts.length ? options.accounts[selectedAccount] : null;
  StatementChoice? get _month => selectedMonth < options.months.length ? options.months[selectedMonth] : null;

  @override
  Future<void> fetch() async {
    options = await _service.options();
    final account = _account, month = _month;
    preview = account == null || month == null
        ? null
        : await _service.statement(accountId: account.id, monthId: month.id);
  }

  Future<void> selectAccount(int index) => _select(() => selectedAccount = index, index == selectedAccount);
  Future<void> selectMonth(int index) => _select(() => selectedMonth = index, index == selectedMonth);

  void selectFormat(StatementFormat f) {
    format = f;
    notifyListeners();
  }

  Future<void> _select(void Function() change, bool unchanged) async {
    if (unchanged) return;
    change();
    notifyListeners();
    await refresh();
  }

  /// Saves the statement where the user picks; confirms with the file name (nothing if cancelled).
  Future<void> download() async {
    final account = _account, month = _month;
    if (account == null || month == null || isDownloading) return;
    isDownloading = true;
    notifyListeners();
    String? saved;
    await perform(() async => saved = await _service.download(accountId: account.id, monthId: month.id, format: format));
    isDownloading = false;
    notifyListeners();
    if (saved != null) showNotice('Statement saved as $saved');
  }
}
