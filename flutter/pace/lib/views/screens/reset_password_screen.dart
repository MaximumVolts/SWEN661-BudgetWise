import 'package:flutter/material.dart'
    show AutofillHints, BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded,
        FontWeight, Icon, Icons, MainAxisAlignment, Padding, Row,
        SafeArea, Scaffold, SingleChildScrollView, SizedBox, State, StatefulWidget, Text, TextEditingController,
        TextField, TextInputAction, TextInputType, TextStyle, ValueChanged, VoidCallback, Widget;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show PaceCard, paceInputDecoration, PaceTopBar, PasswordVisibilityToggle, PillButton, Tap;

typedef ResetPasswordSubmit = void Function(String answer, String newPassword, String confirmPassword);

/// 01c - Reset Password. Step 1 (username) while [question] is null; step 2 (answer + new
/// password) once the account's security question is known.
class ResetPasswordScreen extends StatefulWidget {
  final String? question;
  final String? usernameError;
  final String? answerError;
  final String? passwordError;
  final String? confirmPasswordError;
  final bool isLoading;
  final ValueChanged<String>? onLookUp;
  final ResetPasswordSubmit? onReset;
  final VoidCallback? onBack;
  final VoidCallback? onSignIn;

  const ResetPasswordScreen({
    super.key,
    this.question,
    this.usernameError,
    this.answerError,
    this.passwordError,
    this.confirmPasswordError,
    this.isLoading = false,
    this.onLookUp,
    this.onReset,
    this.onBack,
    this.onSignIn,
  });

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _username = TextEditingController();
  final _answer = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _username.dispose();
    _answer.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  void _lookUp() => widget.onLookUp?.call(_username.text);
  void _reset() => widget.onReset?.call(_answer.text, _password.text, _confirm.text);

  @override
  Widget build(BuildContext context) {
    const field = TextStyle(fontSize: 18);
    final question = widget.question;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Reset password', back: true, onBack: widget.onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: question == null
                      ? [
                          const SizedBox(height: 8),
                          Text('Forgot your password?', style: T.h1),
                          const SizedBox(height: 10),
                          Text('Enter your account’s username and we’ll ask your security question.', style: T.body),
                          const SizedBox(height: 24),
                          TextField(
                            controller: _username,
                            keyboardType: TextInputType.text,
                            autocorrect: false,
                            enableSuggestions: false,
                            textInputAction: TextInputAction.done,
                            autofillHints: const [AutofillHints.username],
                            onSubmitted: (_) => widget.isLoading ? null : _lookUp(),
                            decoration: paceInputDecoration(label: 'Username', error: widget.usernameError),
                            style: field,
                          ),
                          const SizedBox(height: 28),
                          PillButton(
                            widget.isLoading ? 'Checking…' : 'Continue',
                            onPressed: widget.isLoading ? null : _lookUp,
                          ),
                          const SizedBox(height: 24),
                        ]
                      : [
                          const SizedBox(height: 8),
                          Text('Answer your security question', style: T.h1),
                          const SizedBox(height: 18),
                          PaceCard(
                            child: Row(
                              children: [
                                const Icon(Icons.help_outline, size: 24),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(question, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),
                          TextField(
                            controller: _answer,
                            textInputAction: TextInputAction.next,
                            decoration: paceInputDecoration(label: 'Answer', error: widget.answerError, helper: 'Not case-sensitive'),
                            style: field,
                          ),
                          const SizedBox(height: 18),
                          TextField(
                            controller: _password,
                            obscureText: _obscure,
                            textInputAction: TextInputAction.next,
                            autofillHints: const [AutofillHints.newPassword],
                            decoration: paceInputDecoration(label: 
                              'New password',
                              error: widget.passwordError,
                              helper: 'At least 8 characters, with a letter and a number',
                              suffix: PasswordVisibilityToggle(obscured: _obscure, onToggle: () => setState(() => _obscure = !_obscure)),
                            ),
                            style: field,
                          ),
                          const SizedBox(height: 18),
                          TextField(
                            controller: _confirm,
                            obscureText: _obscure,
                            textInputAction: TextInputAction.done,
                            autofillHints: const [AutofillHints.newPassword],
                            onSubmitted: (_) => widget.isLoading ? null : _reset(),
                            decoration: paceInputDecoration(label: 'Confirm new password', error: widget.confirmPasswordError),
                            style: field,
                          ),
                          const SizedBox(height: 28),
                          PillButton(
                            widget.isLoading ? 'Resetting…' : 'Reset password',
                            onPressed: widget.isLoading ? null : _reset,
                          ),
                          const SizedBox(height: 24),
                        ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 4),
              child: Tap(
                onTap: widget.onSignIn,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Remembered it?   ', style: TextStyle(fontSize: 36, color: C.muted)),
                    const Text('Sign in', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700)),
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
