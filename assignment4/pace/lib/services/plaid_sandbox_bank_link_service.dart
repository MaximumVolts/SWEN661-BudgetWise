import '../models/linked_bank.dart' show BankConnection, LinkedItem, SandboxTestCredentials;
import '../models/navigation.dart' show FlowStep, LinkOutcome;
import '../repositories/linked_bank_repository.dart' show LinkedBankRepository;
import '../models/app_exception.dart' show AppException;
import 'bank_link_service.dart' show BankLinkService;
import 'date_labels.dart' show DateLabels;
import '../repositories/plaid_api.dart' show PlaidApi;

/// [BankLinkService] that links a Plaid **Sandbox** test bank. The user never enters bank
/// credentials: the Item is created for a test institution with Plaid's published "simple"
/// sandbox test credentials (see plaid_sandbox_test_credentials in database/schema.sql).
/// BUSINESS RULES: which test institution / products are linked, storing the result for the
/// signed-in user, removing a connection (revoked at Plaid first), and where the user goes next.
class PlaidSandboxBankLinkService implements BankLinkService {
  /// Plaid's sandbox test institution "First Platypus Bank".
  static const testInstitutionId = 'ins_109508';
  static const testInstitutionName = 'First Platypus Bank';
  static const _products = ['transactions'];
  /// Plaid's "Sandbox simple test credentials" (user_good / pass_good).
  static const _credentials = SandboxTestCredentials.simple;

  final PlaidApi _plaid;
  final LinkedBankRepository _banks;
  final String? Function() _currentUserId;
  final DateTime Function() _now;
  final Stream<void> _dataUpdates;

  /// [dataUpdates]: the bank data repository's updates (BankDataRepository.updates).
  PlaidSandboxBankLinkService({
    required PlaidApi plaid,
    required LinkedBankRepository banks,
    required String? Function() currentUserId,
    DateTime Function()? now,
    Stream<void>? dataUpdates,
  })  : _plaid = plaid,
        _dataUpdates = dataUpdates ?? const Stream<void>.empty(),
        _banks = banks,
        _currentUserId = currentUserId,
        _now = now ?? DateTime.now;

  @override
  Stream<void> get dataUpdates => _dataUpdates;

  @override
  Future<LinkOutcome> startLink() async {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in before connecting a bank.');

    final publicToken = await _plaid.createSandboxPublicToken(
      institutionId: testInstitutionId,
      products: _products,
      credentials: _credentials,
    );
    final exchanged = await _plaid.exchangePublicToken(publicToken);
    final result = await _plaid.getAccounts(accessToken: exchanged.accessToken, itemId: exchanged.itemId);

    await _banks.saveItem(
      LinkedItem(
        itemId: exchanged.itemId,
        userId: userId,
        institutionId: testInstitutionId,
        institutionName: result.institutionName ?? testInstitutionName,
        accessToken: exchanged.accessToken,
        sandboxCredentialsLabel: _credentials.label,
        linkedAt: _now(),
      ),
      result.accounts,
    );
    return const LinkOutcome(linked: true, next: FlowStep.home);
  }

  @override
  Future<List<BankConnection>> connections() async {
    final userId = _currentUserId();
    if (userId == null) return const [];
    final accounts = await _banks.accountsFor(userId);
    return [
      for (final item in await _banks.itemsFor(userId))
        BankConnection(
          itemId: item.itemId,
          institutionName: item.institutionName,
          accountCount: accounts.where((a) => a.itemId == item.itemId).length,
          linkedOnLabel: DateLabels.short(item.linkedAt.toLocal()),
        ),
    ];
  }

  /// Only the signed-in user's own connection can be removed. Plaid is told first, so the
  /// access token is revoked before the device forgets it; if Plaid can't be reached, nothing
  /// is deleted and the user can try again.
  @override
  Future<void> removeConnection(String itemId) async {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in to manage your bank connection.');
    LinkedItem? item;
    for (final i in await _banks.itemsFor(userId)) {
      if (i.itemId == itemId) item = i;
    }
    if (item == null) throw const AppException('That bank connection no longer exists.');
    await _plaid.removeItem(item.accessToken);
    await _banks.deleteItem(itemId);
  }
}
