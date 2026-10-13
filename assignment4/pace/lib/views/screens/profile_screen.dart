import 'package:flutter/material.dart'
    show Alignment, AutofillHints, BorderRadius, BorderSide, BoxDecoration, BoxShape, BuildContext, Center, Column, Container,
        CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, OutlineInputBorder, Padding,
        Row, SafeArea, Scaffold, Semantics, SingleChildScrollView, SizedBox, State, StatefulWidget, StatelessWidget, Text,
        TextCapitalization, TextEditingController, TextField, TextInputAction, TextStyle, ValueChanged, VoidCallback,
        Widget;
import '../../models/linked_bank.dart' show BankConnection;
import '../../models/profile.dart' show ProfileData;
import '../theme.dart' show C, T;
import '../widgets/sandbox_notices.dart' show ConnectingToTestEndpoint, TestModeBanner;
import '../widgets/widgets.dart' show Heading, IconBadge, PaceCard, paceInputDecoration, PaceTopBar, PasswordVisibilityToggle, PillButton;

/// Called with the name and the Plaid sandbox keys (an empty secret keeps the stored one).
typedef ProfileSave = void Function(String name, String plaidClientId, String plaidSecret);

/// 16 - Profile: edit the signed-in user's name and Plaid sandbox keys; the username is shown read-only.
class ProfileScreen extends StatefulWidget {
  final ProfileData data;
  final String? nameError;
  final String? plaidClientIdError;
  final String? plaidSecretError;
  final bool isSaving;
  final bool justSaved;
  final ProfileSave? onSave;
  final VoidCallback? onEdited;
  final VoidCallback? onBack;
  /// The user's linked banks (empty = none connected).
  final List<BankConnection> banks;
  final bool isConnectingBank;
  /// itemId of the connection being removed, if any.
  final String? removingBankId;
  final VoidCallback? onConnectBank;
  final ValueChanged<BankConnection>? onRemoveBank;

  const ProfileScreen({
    super.key,
    required this.data,
    this.nameError,
    this.plaidClientIdError,
    this.plaidSecretError,
    this.isSaving = false,
    this.justSaved = false,
    this.onSave,
    this.onEdited,
    this.onBack,
    this.banks = const [],
    this.isConnectingBank = false,
    this.removingBankId,
    this.onConnectBank,
    this.onRemoveBank,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final _name = TextEditingController(text: widget.data.name);
  late final _username = TextEditingController(text: widget.data.username);
  late final _plaidClientId = TextEditingController(text: widget.data.plaidClientId);
  final _plaidSecret = TextEditingController();
  bool _obscureSecret = true;

  @override
  void dispose() {
    _name.dispose();
    _username.dispose();
    _plaidClientId.dispose();
    _plaidSecret.dispose();
    super.dispose();
  }

  void _save() => widget.onSave?.call(_name.text, _plaidClientId.text, _plaidSecret.text);

  @override
  Widget build(BuildContext context) {
    const field = TextStyle(fontSize: 18);
    final data = widget.data;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Profile', back: true, onBack: widget.onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    Center(
                      child: Semantics(
                        label: 'Profile initials ${data.initials}',
                        excludeSemantics: true,
                        child: Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(color: C.ink, shape: BoxShape.circle),
                          alignment: Alignment.center,
                          child: Text(data.initials,
                              style: TextStyle(color: C.lime, fontSize: 32, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    TextField(
                      controller: _name,
                      textCapitalization: TextCapitalization.words,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => widget.isSaving ? null : _save(),
                      autofillHints: const [AutofillHints.name],
                      onChanged: (_) => widget.onEdited?.call(),
                      decoration: paceInputDecoration(label: 'Name', error: widget.nameError),
                      style: field,
                    ),
                    const SizedBox(height: 18),
                    // Read-only: the username is the account's sign-in and can't be changed here.
                    TextField(
                      controller: _username,
                      enabled: false,
                      readOnly: true,
                      decoration: paceInputDecoration(label: 'Username').copyWith(
                        helperText: 'Your username is how you sign in, so it can’t be changed.',
                        helperMaxLines: 2,
                        suffixIcon: const Icon(Icons.lock_outline, size: 20),
                        disabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(6),
                          borderSide: BorderSide(color: C.line),
                        ),
                      ),
                      style: field.copyWith(color: C.muted),
                    ),
                    const SizedBox(height: 18),
                    PaceCard(
                      child: Row(
                        children: [
                          const Icon(Icons.lock_outline, size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Sign-in method', style: T.sub),
                                const SizedBox(height: 2),
                                Text(data.signInMethod.isEmpty ? '—' : data.signInMethod, style: T.row),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                    const Text('Plaid sandbox keys', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(
                      data.hasPlaidKeys
                          ? "Used to connect Plaid's test bank. Leave the secret blank to keep the one you saved."
                          : 'Add your free sandbox keys from dashboard.plaid.com → Developers → Keys to connect a bank.',
                      style: T.body,
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _plaidClientId,
                      textInputAction: TextInputAction.next,
                      autocorrect: false,
                      enableSuggestions: false,
                      onChanged: (_) => widget.onEdited?.call(),
                      decoration: paceInputDecoration(label: 'Client ID', error: widget.plaidClientIdError),
                      style: field,
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _plaidSecret,
                      obscureText: _obscureSecret,
                      textInputAction: TextInputAction.done,
                      autocorrect: false,
                      enableSuggestions: false,
                      onChanged: (_) => widget.onEdited?.call(),
                      onSubmitted: (_) => widget.isSaving ? null : _save(),
                      decoration: paceInputDecoration(
                        label: 'Sandbox secret',
                        hint: data.hasPlaidSecret ? 'Saved · enter a new one to replace it' : null,
                        error: widget.plaidSecretError,
                        suffix: PasswordVisibilityToggle(
                            obscured: _obscureSecret, onToggle: () => setState(() => _obscureSecret = !_obscureSecret)),
                      ),
                      style: field,
                    ),
                    const SizedBox(height: 28),
                    PillButton(widget.isSaving ? 'Saving…' : 'Save changes', onPressed: widget.isSaving ? null : _save),
                    if (widget.justSaved)
                      Padding(
                        padding: const EdgeInsets.only(top: 14),
                        child: Semantics(
                          liveRegion: true,
                          child: Row(
                            children: [
                              Icon(Icons.check_circle_outline, size: 20, color: C.olive),
                              const SizedBox(width: 8),
                              Text('Profile saved', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: C.olive)),
                            ],
                          ),
                        ),
                      ),
                    const SizedBox(height: 32),
                    _BankConnectionSection(
                      banks: widget.banks,
                      isConnecting: widget.isConnectingBank,
                      removingBankId: widget.removingBankId,
                      onConnect: widget.onConnectBank,
                      onRemove: widget.onRemoveBank,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Manage the Plaid connection: remove it when linked, or link the sandbox test bank when not.
class _BankConnectionSection extends StatelessWidget {
  final List<BankConnection> banks;
  final bool isConnecting;
  final String? removingBankId;
  final VoidCallback? onConnect;
  final ValueChanged<BankConnection>? onRemove;
  const _BankConnectionSection({
    required this.banks,
    required this.isConnecting,
    required this.removingBankId,
    this.onConnect,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Heading('Bank connection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        const TestModeBanner(),
        const SizedBox(height: 14),
        if (isConnecting)
          const ConnectingToTestEndpoint()
        else if (banks.isEmpty) ...[
          Text('No bank connected. Link Plaid’s sandbox test bank to try Pace with sample accounts.', style: T.body),
          const SizedBox(height: 16),
          PillButton('Connect test bank with Plaid', icon: Icons.link, filled: false, onPressed: onConnect),
        ] else
          for (final bank in banks) ...[
            PaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const IconBadge(Icons.account_balance_outlined, size: 44),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(bank.institutionName, style: T.row),
                            const SizedBox(height: 2),
                            Text(
                              '${bank.accountCount} ${bank.accountCount == 1 ? 'account' : 'accounts'} · '
                              'Plaid Sandbox · linked ${bank.linkedOnLabel}',
                              style: T.sub,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  PillButton(
                    removingBankId == bank.itemId ? 'Removing…' : 'Remove connection',
                    icon: Icons.link_off,
                    filled: false,
                    height: 48,
                    foreground: C.red,
                    onPressed: removingBankId != null || onRemove == null ? null : () => onRemove!(bank),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}
