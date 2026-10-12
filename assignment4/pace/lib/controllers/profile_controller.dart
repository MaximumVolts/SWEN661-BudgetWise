import '../models/linked_bank.dart' show BankConnection;
import '../models/profile.dart' show ProfileData;
import 'app_navigator.dart' show AppNavigator;
import '../services/bank_link_service.dart' show BankLinkService;
import '../services/profile_service.dart' show ProfileService;
import 'base_controller.dart' show FormController;

/// UI state for the Profile screen: the loaded profile and bank connection, saving / connecting /
/// removing flags, inline field errors (keyed 'name') and a "saved" confirmation. Rules live in the
/// services.
class ProfileController extends FormController {
  final ProfileService _profile;
  final BankLinkService _bankLink;
  ProfileController({required ProfileService profile, required BankLinkService bankLink, required AppNavigator navigator})
      : _profile = profile,
        _bankLink = bankLink,
        super(navigator);

  ProfileData? data;
  /// The user's linked banks; empty when none is connected.
  List<BankConnection> banks = const [];
  bool isConnectingBank = false;
  /// itemId of the connection being removed, if any.
  String? removingBankId;
  /// True after a successful save, until the user edits a field again.
  bool justSaved = false;
  @override
  Future<void> fetch() async {
    data = await _profile.load();
    banks = await _bankLink.connections();
  }

  /// Clears the "saved" confirmation once the user starts editing again.
  void edited() {
    if (!justSaved) return;
    justSaved = false;
    notifyListeners();
  }

  Future<void> save({required String name}) async {
    justSaved = false;
    justSaved = await submit(() async => data = await _profile.update(name: name));
    notifyListeners();
  }

  /// Links the Plaid sandbox test bank, then shows it here (stays on Profile).
  Future<void> connectBank() async {
    if (isConnectingBank) return;
    isConnectingBank = true;
    notifyListeners();
    await perform(() async {
      await _bankLink.startLink();
      banks = await _bankLink.connections();
    });
    isConnectingBank = false;
    notifyListeners();
  }

  /// Asks first, then disconnects [bank] and refreshes the list.
  Future<void> removeBank(BankConnection bank) async {
    if (removingBankId != null) return;
    if (!await navigator.confirmRemoveBankConnection(bank.institutionName)) return;
    removingBankId = bank.itemId;
    notifyListeners();
    await perform(() async {
      await _bankLink.removeConnection(bank.itemId);
      banks = await _bankLink.connections();
    });
    removingBankId = null;
    notifyListeners();
  }
}
