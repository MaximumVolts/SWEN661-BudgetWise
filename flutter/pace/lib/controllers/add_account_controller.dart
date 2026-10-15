import '../models/linked_bank.dart' show SandboxInstitution;
import '../services/bank_link_service.dart' show BankLinkService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;

/// Accounts → Add an account: pick one of the test banks not linked yet, link it, and go back to
/// where the user came from (which reloads with the new accounts).
class AddAccountController extends ScreenController {
  final BankLinkService _link;
  AddAccountController({required BankLinkService link, required AppNavigator navigator})
      : _link = link,
        super(navigator);

  List<SandboxInstitution> institutions = const [];
  /// The chosen bank's id; starts on the first one not linked yet.
  String? selectedId;
  bool isConnecting = false;

  /// The banks the user can still add.
  List<SandboxInstitution> get available => [for (final i in institutions) if (!i.isLinked) i];

  SandboxInstitution? get selected => available.where((i) => i.id == selectedId).firstOrNull;

  @override
  Future<void> fetch() async {
    institutions = await _link.institutions();
    if (selected == null) selectedId = available.firstOrNull?.id;
  }

  void select(SandboxInstitution institution) {
    if (institution.isLinked || isConnecting) return;
    selectedId = institution.id;
    notifyListeners();
  }

  Future<void> connect() async {
    final institution = selected;
    if (institution == null || isConnecting) return;
    isConnecting = true;
    notifyListeners();
    final ok = await perform(() => _link.startLink(institutionId: institution.id));
    isConnecting = false;
    notifyListeners();
    if (ok) navigator.back();
  }
}
