/// A user's Plaid **Sandbox** API keys (client ID + sandbox secret), entered when they create
/// their Pace account (or later on Profile) and stored with it on the device. Get them from
/// https://dashboard.plaid.com/developers/keys. Sandbox keys only: Pace never talks to Plaid's
/// production or development environments.
///
/// These keys identify the caller to Plaid and are required even in the sandbox; they are
/// unrelated to the test *bank* login (user_good / pass_good, see SandboxTestCredentials).
///
/// Prototype note: Plaid expects its secret to live on a server. It's kept on the device here only
/// because this prototype runs purely on device against the sandbox, where no real data exists.
class PlaidKeys {
  final String clientId;
  final String sandboxSecret;
  const PlaidKeys({required this.clientId, required this.sandboxSecret});
  static const none = PlaidKeys(clientId: '', sandboxSecret: '');
  bool get isComplete => clientId.isNotEmpty && sandboxSecret.isNotEmpty;
}
