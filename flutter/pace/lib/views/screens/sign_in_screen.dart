import 'package:flutter/material.dart'
    show Align, Alignment, AutofillHints, BorderRadius, BoxDecoration, BuildContext, Column, Container,
        CrossAxisAlignment, Divider, EdgeInsets, Expanded, FontWeight, Icon, Icons, MainAxisAlignment, Padding, Row, SafeArea, Scaffold, SingleChildScrollView, SizedBox, State,
        StatefulWidget, Text, TextEditingController, TextField, TextInputType, TextStyle, VoidCallback, Widget;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show paceInputDecoration, PasswordVisibilityToggle, PillButton, Tap;

/// 01 - Sign In
class SignInScreen extends StatefulWidget {
  /// Optional: supply your own controllers (e.g. from a form/bloc). Otherwise internal ones are used.
  final TextEditingController? emailController;
  final TextEditingController? passwordController;
  final String? usernameError;
  final String? passwordError;
  final bool isLoading;
  final void Function(String username, String password)? onSignIn;
  final VoidCallback? onForgotPassword;
  final VoidCallback? onContinueWithGoogle;
  final VoidCallback? onContinueWithApple;
  final VoidCallback? onCreateAccount;
  /// Shows the "or" divider plus the Google / Apple buttons. Hidden for now; the callbacks
  /// above stay wired so turning this on is all it takes to bring them back.
  final bool showSocialSignIn;

  const SignInScreen({
    super.key,
    this.emailController,
    this.passwordController,
    this.usernameError,
    this.passwordError,
    this.isLoading = false,
    this.onSignIn,
    this.onForgotPassword,
    this.onContinueWithGoogle,
    this.onContinueWithApple,
    this.onCreateAccount,
    this.showSocialSignIn = false,
  });

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  bool _obscure = true;
  late final TextEditingController _username = widget.emailController ?? TextEditingController();
  late final TextEditingController _password = widget.passwordController ?? TextEditingController();

  @override
  void dispose() {
    if (widget.emailController == null) _username.dispose();
    if (widget.passwordController == null) _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.speed_rounded, size: 24),
                        ),
                        const SizedBox(width: 16),
                        const Text('Pace', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 40),
                    Text('Your money, at your pace.', style: T.display),
                    const SizedBox(height: 20),
                    Text(
                      'Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.',
                      style: T.body,
                    ),
                    const SizedBox(height: 28),
                    TextField(
                      controller: _username,
                      keyboardType: TextInputType.text,
                      autocorrect: false,
                      enableSuggestions: false,
                      autofillHints: const [AutofillHints.username],
                      decoration: paceInputDecoration(label: 'Username', error: widget.usernameError),
                      style: const TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      style: const TextStyle(fontSize: 18),
                      decoration: paceInputDecoration(label: 
                        'Password',
                        error: widget.passwordError,
                        suffix: PasswordVisibilityToggle(obscured: _obscure, onToggle: () => setState(() => _obscure = !_obscure)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Align(
                      alignment: Alignment.center,
                      child: Tap(
                        onTap: widget.onForgotPassword,
                        child: const Text('Forgot password?', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 36)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    PillButton(
                      widget.isLoading ? 'Signing in…' : 'Sign in',
                      onPressed: widget.isLoading ? null : () => widget.onSignIn?.call(_username.text, _password.text),
                    ),
                    if (widget.showSocialSignIn) ...[
                      const SizedBox(height: 22),
                      Row(
                        children: [
                          Expanded(child: Divider(color: C.line)),
                          Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('or', style: T.sub)),
                          Expanded(child: Divider(color: C.line)),
                        ],
                      ),
                      const SizedBox(height: 22),
                      PillButton('Continue with Google', filled: false, onPressed: widget.onContinueWithGoogle),
                      const SizedBox(height: 16),
                      PillButton('Continue with Apple', filled: false, onPressed: widget.onContinueWithApple),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 12, top: 4),
              child: Text('New to Pace?', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700))
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 4),
              child: Tap(
                onTap: widget.onCreateAccount,
                child: const Text('New account', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700))
              ),
            ),
          ],
        ),
      ),
    );
  }
}
