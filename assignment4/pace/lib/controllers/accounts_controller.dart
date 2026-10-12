import '../models/account.dart' show AccountsData, LinkedAccount;
import '../services/account_service.dart' show AccountService;
import '../services/app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;

class AccountsController extends ScreenController {
  final AccountService _accounts;
  AccountsController({required AccountService accounts, required AppNavigator navigator})
      : _accounts = accounts,
        super(navigator);

  AccountsData? data;

  @override
  Future<void> fetch() async => data = await _accounts.getAccounts();

  Future<void> reconnect() async {
    if (await perform(_accounts.reconnect)) await refresh();
  }

  Future<void> dismissBanner() async {
    if (await perform(_accounts.dismissReconnectBanner)) await refresh();
  }

  void linkAccount() => navigator.openConnectBank();
  void openAccount(LinkedAccount a) => navigator.openAccountDetail(a.id);
  void openMenu() => navigator.openMenu('accounts');
}
