import 'dart:convert' show jsonDecode, jsonEncode;
import 'package:shared_preferences/shared_preferences.dart' show SharedPreferencesAsync;
import '../models/linked_bank.dart' show LinkedBankAccount, LinkedItem;
import 'linked_bank_repository.dart' show LinkedBankRepository;

/// [LinkedBankRepository] that keeps linked banks on this device only (shared_preferences).
/// Stored as one JSON object under [storageKey]: `{"items": [...], "accounts": [...]}`.
///
/// Prototype note: Plaid access tokens are kept here in plain app storage, which is acceptable
/// only because they are sandbox tokens. Real tokens belong on a server (or at minimum in the
/// platform keychain / keystore).
class DeviceLinkedBankRepository implements LinkedBankRepository {
  static const storageKey = 'pace.linked_banks';

  /// Created on first use, so building the app's services never touches device storage.
  late final SharedPreferencesAsync _prefs = _injected ?? SharedPreferencesAsync();
  final SharedPreferencesAsync? _injected;
  DeviceLinkedBankRepository([SharedPreferencesAsync? prefs]) : _injected = prefs;

  Future<({List<LinkedItem> items, List<LinkedBankAccount> accounts})> _read() async {
    final raw = await _prefs.getString(storageKey);
    if (raw == null) return (items: <LinkedItem>[], accounts: <LinkedBankAccount>[]);
    final j = jsonDecode(raw) as Map<String, dynamic>;
    return (
      items: [for (final e in j['items'] as List<dynamic>) _itemFromJson(e as Map<String, dynamic>)],
      accounts: [for (final e in j['accounts'] as List<dynamic>) _accountFromJson(e as Map<String, dynamic>)],
    );
  }

  Future<void> _write(List<LinkedItem> items, List<LinkedBankAccount> accounts) => _prefs.setString(
        storageKey,
        jsonEncode({
          'items': [for (final i in items) _itemToJson(i)],
          'accounts': [for (final a in accounts) _accountToJson(a)],
        }),
      );

  @override
  Future<List<LinkedItem>> itemsFor(String userId) async =>
      [for (final i in (await _read()).items) if (i.userId == userId) i];

  @override
  Future<List<LinkedBankAccount>> accountsFor(String userId) async {
    final data = await _read();
    final ids = {for (final i in data.items) if (i.userId == userId) i.itemId};
    return [for (final a in data.accounts) if (ids.contains(a.itemId)) a];
  }

  @override
  Future<void> saveItem(LinkedItem item, List<LinkedBankAccount> accounts) async {
    final data = await _read();
    await _write(
      [for (final i in data.items) if (i.itemId != item.itemId) i, item],
      [for (final a in data.accounts) if (a.itemId != item.itemId) a, ...accounts],
    );
  }

  @override
  Future<void> deleteItem(String itemId) async {
    final data = await _read();
    await _write(
      [for (final i in data.items) if (i.itemId != itemId) i],
      [for (final a in data.accounts) if (a.itemId != itemId) a],
    );
  }

  static Map<String, Object?> _itemToJson(LinkedItem i) => {
        'itemId': i.itemId,
        'userId': i.userId,
        'institutionId': i.institutionId,
        'institutionName': i.institutionName,
        'accessToken': i.accessToken,
        'sandboxCredentialsLabel': i.sandboxCredentialsLabel,
        'linkedAt': i.linkedAt.toUtc().toIso8601String(),
      };

  static LinkedItem _itemFromJson(Map<String, dynamic> j) => LinkedItem(
        itemId: j['itemId'] as String,
        userId: j['userId'] as String,
        institutionId: j['institutionId'] as String?,
        institutionName: j['institutionName'] as String,
        accessToken: j['accessToken'] as String,
        sandboxCredentialsLabel: j['sandboxCredentialsLabel'] as String? ?? 'simple',
        linkedAt: DateTime.parse(j['linkedAt'] as String),
      );

  static Map<String, Object?> _accountToJson(LinkedBankAccount a) => {
        'accountId': a.accountId,
        'itemId': a.itemId,
        'name': a.name,
        'mask': a.mask,
        'type': a.type,
        'subtype': a.subtype,
        'currentBalance': a.currentBalance,
        'availableBalance': a.availableBalance,
        'currency': a.currency,
      };

  static LinkedBankAccount _accountFromJson(Map<String, dynamic> j) => LinkedBankAccount(
        accountId: j['accountId'] as String,
        itemId: j['itemId'] as String,
        name: j['name'] as String,
        mask: j['mask'] as String?,
        type: j['type'] as String,
        subtype: j['subtype'] as String?,
        currentBalance: (j['currentBalance'] as num?)?.toDouble(),
        availableBalance: (j['availableBalance'] as num?)?.toDouble(),
        currency: j['currency'] as String?,
      );
}
