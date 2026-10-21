/// OAuth client IDs from Google Cloud Console, supplied at build time:
///
///   flutter run --dart-define-from-file=config/google_sign_in.json
///
/// iOS also needs the reversed iOS client ID in ios/Flutter/GoogleSignIn.xcconfig (URL scheme).
/// See README "Google Sign-In setup".
class GoogleSignInConfig {
  /// The *Web application* client ID. Required on Android; optional on iOS.
  static const serverClientId = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');

  /// The *iOS* client ID. Required on iOS.
  static const iosClientId = String.fromEnvironment('GOOGLE_IOS_CLIENT_ID');
}
