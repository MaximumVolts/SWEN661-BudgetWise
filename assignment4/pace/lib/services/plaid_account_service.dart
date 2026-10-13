import '../models/account.dart' show AccountGroup, AccountsData, LinkedAccount;
import 'bank_data_service.dart' show BankDataService;
import '../models/linked_bank.dart' show LinkedBankAccount;
import 'account_service.dart' show AccountService;
import 'date_labels.dart' show DateLabels;

/// [AccountService] showing the linked banks' live balances from Plaid (sandbox).
/// BUSINESS RULES: one group per linked bank; money owed (credit cards, loans) shown as negative.
class PlaidAccountService extends BankDataService implements AccountService {
  static const noBankMessage =
      "No bank connected yet. Connect Plaid's test bank from your Profile to see your accounts here.";

  PlaidAccountService(super.bankData, {super.now});

  @override
  Future<AccountsData> getAccounts() async {
    final snap = await bankData.load();
    if (!snap.isLinked) return const AccountsData(groups: [], emptyMessage: noBankMessage);
    final synced = 'Plaid Sandbox · updated ${DateLabels.ago(snap.fetchedAt, currentTime())}';
    return AccountsData(groups: [
      for (final item in snap.institutions.entries)
        AccountGroup(
          title: item.value,
          institution: 'Plaid Sandbox test bank',
          accounts: [
            for (final a in snap.accounts)
              if (a.itemId == item.key)
                LinkedAccount(
                  id: a.accountId,
                  name: a.name,
                  subtitle: subtitleFor(a),
                  balance: balanceOf(a),
                  iconKey: iconFor(a),
                  syncLabel: synced,
                ),
          ],
        ),
    ]);
  }

  /// Re-fetches from the bank.
  @override
  Future<void> reconnect() async => bankData.load(refresh: true);

  @override
  Future<void> dismissReconnectBanner() async {}

  /// Credit cards and loans are money owed, so they count against you.
  static bool isLiability(LinkedBankAccount a) => a.type == 'credit' || a.type == 'loan';

  static double balanceOf(LinkedBankAccount a) {
    final current = a.currentBalance ?? a.availableBalance ?? 0;
    return isLiability(a) ? -current : current;
  }

  /// e.g. "Checking ••0000"
  static String subtitleFor(LinkedBankAccount a) {
    final kind = a.subtype ?? a.type;
    final label = kind.isEmpty ? 'Account' : '${kind[0].toUpperCase()}${kind.substring(1)}';
    return a.mask == null ? label : '$label ••${a.mask}';
  }

  static String iconFor(LinkedBankAccount a) => switch ((a.type, a.subtype)) {
        ('depository', 'checking') => 'bank',
        ('depository', _) => 'savings',
        ('credit', _) => 'card',
        ('loan', 'mortgage' || 'home equity') => 'home',
        ('loan', 'auto') => 'car',
        ('loan', _) => 'bills',
        ('investment', _) => 'chart',
        _ => 'wallet',
      };
}
