import 'package:flutter/material.dart'
    show
        AutofillGroup,
        AutofillHints,
        BuildContext,
        Column,
        CrossAxisAlignment,
        DropdownButtonFormField,
        DropdownMenuItem,
        EdgeInsets,
        Expanded,
        FontWeight,
        MainAxisAlignment,
        Padding,
        Row,
        SafeArea,
        Scaffold,
        SingleChildScrollView,
        SizedBox,
        State,
        StatefulWidget,
        Text,
        TextCapitalization,
        TextEditingController,
        TextField,
        TextInputAction,
        TextInputType,
        TextOverflow,
        TextStyle,
        VoidCallback,
        Widget;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart'
    show
        paceInputDecoration,
        PaceTopBar,
        PasswordVisibilityToggle,
        PillButton,
        Tap;

/// Called with the raw form values; the service validates them.
typedef CreateAccountSubmit = void Function(
    String name,
    String username,
    String password,
    String confirmPassword,
    String securityQuestion,
    String securityAnswer,
    String plaidClientId,
    String plaidSecret);

/// 01b - Create Account
class CreateAccountScreen extends StatefulWidget {
  final String? nameError;
  final String? usernameError;
  final String? passwordError;
  final String? confirmPasswordError;
  final String? securityQuestionError;
  final String? securityAnswerError;
  final String? plaidClientIdError;
  final String? plaidSecretError;

  /// Choices for the security question picker.
  final List<String> securityQuestions;
  final bool isLoading;
  final CreateAccountSubmit? onSubmit;
  final VoidCallback? onBack;
  final VoidCallback? onSignIn;

  const CreateAccountScreen({
    super.key,
    this.nameError,
    this.usernameError,
    this.passwordError,
    this.confirmPasswordError,
    this.securityQuestionError,
    this.securityAnswerError,
    this.plaidClientIdError,
    this.plaidSecretError,
    this.securityQuestions = const [],
    this.isLoading = false,
    this.onSubmit,
    this.onBack,
    this.onSignIn,
  });

  @override
  State<CreateAccountScreen> createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  final _name = TextEditingController();
  final _username = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _answer = TextEditingController();
  final _plaidClientId = TextEditingController();
  final _plaidSecret = TextEditingController();
  String? _question;
  bool _obscure = true;
  bool _obscureSecret = true;

  @override
  void dispose() {
    _name.dispose();
    _username.dispose();
    _password.dispose();
    _confirm.dispose();
    _answer.dispose();
    _plaidClientId.dispose();
    _plaidSecret.dispose();
    super.dispose();
  }

  void _submit() => widget.onSubmit?.call(
      _name.text,
      _username.text,
      _password.text,
      _confirm.text,
      _question ?? '',
      _answer.text,
      _plaidClientId.text,
      _plaidSecret.text);

  @override
  Widget build(BuildContext context) {
    const field = TextStyle(fontSize: 18);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Create account', back: true, onBack: widget.onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: AutofillGroup(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text('Start your Pace account', style: T.h1),
                      const SizedBox(height: 10),
                      Text('Your account is stored only on this device.',
                          style: T.body),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _name,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.name],
                        decoration: paceInputDecoration(
                            label: 'Name', error: widget.nameError),
                        style: field,
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _username,
                        keyboardType: TextInputType.text,
                        autocorrect: false,
                        enableSuggestions: false,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.username],
                        decoration: paceInputDecoration(
                            label: 'Username',
                            error: widget.usernameError,
                            helper:
                                '3–30 letters, numbers, dots, dashes or underscores'),
                        style: field,
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _password,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.newPassword],
                        decoration: paceInputDecoration(
                          label: 'Password',
                          error: widget.passwordError,
                          helper:
                              'At least 8 characters, with a letter and a number',
                          suffix: PasswordVisibilityToggle(
                              obscured: _obscure,
                              onToggle: () =>
                                  setState(() => _obscure = !_obscure)),
                        ),
                        style: field,
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _confirm,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.newPassword],
                        decoration: paceInputDecoration(
                            label: 'Confirm password',
                            error: widget.confirmPasswordError),
                        style: field,
                      ),
                      const SizedBox(height: 28),
                      const Text('Security question',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('Used to reset your password if you forget it.',
                          style: T.body),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        initialValue: _question,
                        isExpanded: true,
                        decoration: paceInputDecoration(
                            label: 'Question',
                            error: widget.securityQuestionError),
                        style: field.copyWith(color: C.ink),
                        items: [
                          for (final q in widget.securityQuestions)
                            DropdownMenuItem(
                                value: q,
                                child:
                                    Text(q, overflow: TextOverflow.ellipsis)),
                        ],
                        onChanged: (q) => setState(() => _question = q),
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _answer,
                        textInputAction: TextInputAction.next,
                        decoration: paceInputDecoration(
                            label: 'Answer',
                            error: widget.securityAnswerError,
                            helper: 'Not case-sensitive'),
                        style: field,
                      ),
                      const SizedBox(height: 28),
                      const Text('Plaid sandbox keys',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        "Pace links Plaid's test bank with your own free sandbox keys. Find them at "
                        'dashboard.plaid.com → Developers → Keys. Use the Sandbox secret, never Production.',
                        style: T.body,
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: _plaidClientId,
                        textInputAction: TextInputAction.next,
                        autocorrect: false,
                        enableSuggestions: false,
                        decoration: paceInputDecoration(
                            label: 'Client ID',
                            error: widget.plaidClientIdError),
                        style: field,
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _plaidSecret,
                        obscureText: _obscureSecret,
                        textInputAction: TextInputAction.done,
                        autocorrect: false,
                        enableSuggestions: false,
                        onSubmitted: (_) => widget.isLoading ? null : _submit(),
                        decoration: paceInputDecoration(
                          label: 'Sandbox secret',
                          error: widget.plaidSecretError,
                          helper:
                              'Stored only on this device, with your account',
                          suffix: PasswordVisibilityToggle(
                              obscured: _obscureSecret,
                              onToggle: () => setState(
                                  () => _obscureSecret = !_obscureSecret)),
                        ),
                        style: field,
                      ),
                      const SizedBox(height: 28),
                      PillButton(
                        widget.isLoading
                            ? 'Creating account…'
                            : 'Create account',
                        onPressed: widget.isLoading ? null : _submit,
                      ),
                      const SizedBox(height: 24),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12, top: 4),
                        child: Tap(
                          onTap: widget.onSignIn,
                          semanticLabel: 'Existing account? Sign in',
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Existing account?   ',
                                  style: TextStyle(fontSize: 16, color: C.muted)),
                              const Text('Sign in',
                                  style: TextStyle(
                                      fontSize: 16, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
