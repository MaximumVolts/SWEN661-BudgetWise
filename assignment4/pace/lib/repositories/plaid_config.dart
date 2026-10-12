import 'package:flutter/services.dart' show MethodChannel, MissingPluginException, PlatformException;

/// Plaid **Sandbox** API keys (client ID + sandbox secret).
///
/// They live in the git-ignored android/local.properties:
///
///   plaid.clientId=…
///   plaid.sandboxSecret=…
///
/// Gradle compiles them into BuildConfig.PLAID_CLIENT_ID / BuildConfig.PLAID_SANDBOX_SECRET
/// (android/app/build.gradle.kts) and MainActivity hands them to Dart over the
/// "pace/plaid_config" channel. Get them from https://dashboard.plaid.com/developers/keys.
/// Never use production keys. Edit local.properties, then rebuild (stop and re-run the app).
///
/// These API keys identify the app to Plaid and are required even in the sandbox; they are
/// unrelated to the test *bank* login (user_good / pass_good, see SandboxTestCredentials).
///
/// Prototype note: Plaid expects its secret to live on a server. It's built into the app here
/// only because this prototype runs purely on device against the sandbox, where no real data exists.
class PlaidKeys {
  final String clientId;
  final String sandboxSecret;
  const PlaidKeys({required this.clientId, required this.sandboxSecret});
  static const none = PlaidKeys(clientId: '', sandboxSecret: '');
  bool get isComplete => clientId.isNotEmpty && sandboxSecret.isNotEmpty;
}

class PlaidConfig {
  static const _channel = MethodChannel('pace/plaid_config');
  static Future<PlaidKeys>? _cached;

  /// Reads the keys from Android's BuildConfig once. Platforms without them (iOS, desktop, tests)
  /// get [PlaidKeys.none], which the API reports as "not set up".
  static Future<PlaidKeys> load() => _cached ??= _read();

  static Future<PlaidKeys> _read() async {
    try {
      final keys = await _channel.invokeMapMethod<String, String>('sandboxKeys');
      return PlaidKeys(clientId: keys?['clientId'] ?? '', sandboxSecret: keys?['sandboxSecret'] ?? '');
    } on MissingPluginException {
      return PlaidKeys.none;
    } on PlatformException {
      return PlaidKeys.none;
    }
  }
}
