import 'dart:async' show StreamController;
import '../models/linked_bank.dart' show BankConnection, LinkedItem, SandboxInstitution, SandboxTestCredentials;
import '../models/navigation.dart' show FlowStep, LinkOutcome;
import '../repositories/linked_bank_repository.dart' show LinkedBankRepository;
import '../models/app_exception.dart' show AppException;
import 'bank_link_service.dart' show BankLinkService;
import 'date_labels.dart' show DateLabels;
import '../repositories/plaid_api.dart' show PlaidApi;

/// [BankLinkService] that links a Plaid **Sandbox** test bank. The user never enters bank
/// credentials: the Item is created for a test institution with Plaid's published "simple"
/// sandbox test credentials (see plaid_sandbox_test_credentials in database/schema.sql).
/// BUSINESS RULES: which test institutions can be linked (Plaid's sandbox test banks, each once per
/// user; the first linked is First Platypus Bank), which products, storing the result for the
/// signed-in user, removing a connection (revoked at Plaid first), and where the user goes next.
class PlaidSandboxBankLinkService implements BankLinkService {
  /// Plaid's sandbox test institution "First Platypus Bank", linked first (e.g. during sign-up).
  static const testInstitutionId = 'ins_109508';
  static const testInstitutionName = 'First Platypus Bank';

  /// Plaid's sandbox test banks (https://plaid.com/docs/sandbox/institutions/). They all hold
  /// Plaid's sample data, never real accounts.
  static const testInstitutions = [
    (id: testInstitutionId, name: testInstitutionName),
    (id: 'ins_109509', name: 'First Gingham Credit Union'),
    (id: 'ins_109510', name: 'Tattersall Federal Credit Union'),
    (id: 'ins_109511', name: 'Tartan Bank'),
    (id: 'ins_109512', name: 'Houndstooth Bank'),
  ];
  static const _products = ['transactions'];
  /// Plaid's "Sandbox simple test credentials" (user_good / pass_good).
  static const _credentials = SandboxTestCredentials.simple;

  final PlaidApi _plaid;
  final LinkedBankRepository _banks;
  final String? Function() _currentUserId;
  final DateTime Function() _now;
  final _dataUpdates = StreamController<void>.broadcast();

  /// [dataUpdates]: the bank data repository's updates (BankDataRepository.updates).
  PlaidSandboxBankLinkService({
    required PlaidApi plaid,
    required LinkedBankRepository banks,
    required String? Function() currentUserId,
    DateTime Function()? now,
    Stream<void>? dataUpdates,
  })  : _plaid = plaid,
        _banks = banks,
        _currentUserId = currentUserId,
        _now = now ?? DateTime.now {
    dataUpdates?.listen(_dataUpdates.add);
  }

  /// The bank data's own updates, plus one whenever a bank is linked or removed here.
  @override
  Stream<void> get dataUpdates => _dataUpdates.stream;

  @override
  Future<List<SandboxInstitution>> institutions() async {
    final userId = _currentUserId();
    final linked = userId == null ? const <String?>{} : {for (final i in await _banks.itemsFor(userId)) i.institutionId};
    return [for (final i in testInstitutions) SandboxInstitution(id: i.id, name: i.name, isLinked: linked.contains(i.id))];
  }

  @override
  Future<LinkOutcome> startLink({String? institutionId}) async {
    final userId = _currentUserId();
    if (userId == null) throw const AppException('Sign in before connecting a bank.');
    final options = await institutions();
    final SandboxInstitution institution;
    if (institutionId == null) {
      institution = options.firstWhere((i) => !i.isLinked,
          orElse: () => throw const AppException("All of Plaid's test banks are already connected."));
    } else {
      institution = options.firstWhere((i) => i.id == institutionId,
          orElse: () => throw const AppException("That isn't one of Plaid's test banks."));
      if (institution.isLinked) throw AppException('${institution.name} is already connected.');
    }

    final publicToken = await _plaid.createSandboxPublicToken(
      institutionId: institution.id,
      products: _products,
      credentials: _credentials,
    );
    final exchanged = await _plaid.exchangePublicToken(publicToken);
    final result = await _plaid.getAccounts(accessToken: exchanged.accessToken, itemId: exchanged.itemId);

    await _banks.saveItem(
      LinkedItem(
        itemId: exchanged.itemId,
        userId: userId,
        institutionId: institution.id,
        institutionName: institution.name, // the test bank chosen (one of [testInstitutions])
        accessToken: exchanged.accessToken,
        sandboxCredentialsLabel: _credentials.label,
        linkedAt: _now(),
      ),
      result.accounts,
    );
    _dataUpdates.add(null);
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
    _dataUpdates.add(null);
  }
}
