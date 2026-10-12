import 'package:flutter/foundation.dart' show TargetPlatform, defaultTargetPlatform, kDebugMode;
import 'package:google_sign_in/google_sign_in.dart'
    show GoogleSignIn, GoogleSignInAccount, GoogleSignInException, GoogleSignInExceptionCode;
import '../models/google_account.dart' show GoogleAccount;
import '../models/app_exception.dart' show AppException;
import 'google_account_repository.dart' show GoogleAccountRepository;
import 'google_sign_in_config.dart' show GoogleSignInConfig;

/// [GoogleAccountRepository] on the official google_sign_in plugin (Android Credential Manager,
/// iOS GoogleSignIn SDK).
class GoogleSignInAccountRepository implements GoogleAccountRepository {
  static const _notConfigured = "Google sign-in isn't set up for this build yet.";
  /// Debug builds say exactly what's missing, since the fix is a developer step.
  static const _notConfiguredDebug = 'Google sign-in needs OAuth client IDs: add them to config/google_sign_in.json '
      'and run with --dart-define-from-file=config/google_sign_in.json (see README).';
  static const _failed = "Couldn't sign in with Google. Please try again.";

  final GoogleSignIn _plugin;
  final String _serverClientId;
  final String _iosClientId;
  Future<void>? _initialized;

  GoogleSignInAccountRepository({
    GoogleSignIn? plugin,
    String serverClientId = GoogleSignInConfig.serverClientId,
    String iosClientId = GoogleSignInConfig.iosClientId,
  })  : _plugin = plugin ?? GoogleSignIn.instance,
        _serverClientId = serverClientId,
        _iosClientId = iosClientId;

  bool get _isIos => defaultTargetPlatform == TargetPlatform.iOS;

  /// Missing IDs would otherwise fail inside the native SDK (on iOS, by crashing the app).
  bool get _isConfigured => switch (defaultTargetPlatform) {
        TargetPlatform.android => _serverClientId.isNotEmpty,
        TargetPlatform.iOS => _iosClientId.isNotEmpty,
        _ => false,
      };

  /// The plugin must be initialized exactly once; a failed attempt may be retried.
  Future<void> _ensureInitialized() => _initialized ??= _plugin
          .initialize(
            clientId: _isIos ? _iosClientId : null,
            serverClientId: _serverClientId.isEmpty ? null : _serverClientId,
          )
          .catchError((Object e) {
        _initialized = null;
        throw e;
      });

  @override
  Future<GoogleAccount?> signIn() async {
    if (!_isConfigured) throw const AppException(kDebugMode ? _notConfiguredDebug : _notConfigured);
    try {
      await _ensureInitialized();
      if (!_plugin.supportsAuthenticate()) throw const AppException(_failed);
      return _toModel(await _plugin.authenticate());
    } on GoogleSignInException catch (e) {
      switch (e.code) {
        case GoogleSignInExceptionCode.canceled:
          return null;
        case GoogleSignInExceptionCode.clientConfigurationError:
        case GoogleSignInExceptionCode.providerConfigurationError:
          throw AppException(_notConfigured, cause: e);
        default:
          throw AppException(_failed, cause: e);
      }
    }
  }

  @override
  Future<void> signOut() async {
    final init = _initialized;
    if (init == null) return; // never signed in with Google this run
    try {
      await init;
      await _plugin.signOut();
    } on Object {
      // Signing out of Pace must not fail because Google couldn't be reached.
    }
  }

  static GoogleAccount _toModel(GoogleSignInAccount a) => GoogleAccount(
        id: a.id,
        email: a.email,
        displayName: a.displayName,
        photoUrl: a.photoUrl,
        idToken: a.authentication.idToken,
      );
}
