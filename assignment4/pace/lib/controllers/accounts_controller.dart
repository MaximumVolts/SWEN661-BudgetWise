import '../models/account.dart' show AccountsData, LinkedAccount;
import '../services/account_service.dart' show AccountService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;

class AccountsController extends ScreenController {
  final AccountService _accounts;
  AccountsController({required AccountService accounts, required AppNavigator navigator})
      : _accounts = accounts,
        super(navigator);

  AccountsData? data;

  @override
  Future<void> fetch() async => data = await _accounts.getAccounts();

  Future<void> reconnect() => performAndRefresh(_accounts.reconnect);

  Future<void> dismissBanner() => performAndRefresh(_accounts.dismissReconnectBanner);

  void linkAccount() => navigator.openAddAccount();
  void openAccount(LinkedAccount a) => navigator.openAccountDetail(a.id);
  void openMenu() => navigator.openMenu('accounts');
}
