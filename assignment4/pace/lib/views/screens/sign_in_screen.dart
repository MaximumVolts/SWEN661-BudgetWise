import 'package:flutter/material.dart'
    show Align, Alignment, AutofillHints, BorderRadius, BorderSide, BoxDecoration, BuildContext, Column, Container,
        CrossAxisAlignment, Divider, EdgeInsets, Expanded, FontWeight, Icon, IconButton, Icons, InputDecoration,
        MainAxisAlignment, OutlineInputBorder, Padding, Row, SafeArea, Scaffold, SingleChildScrollView, SizedBox, State,
        StatefulWidget, Text, TextEditingController, TextField, TextInputType, TextStyle, VoidCallback, Widget;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show PillButton, Tap;

/// 01 - Sign In
class SignInScreen extends StatefulWidget {
  /// Optional: supply your own controllers (e.g. from a form/bloc). Otherwise internal ones are used.
  final TextEditingController? emailController;
  final TextEditingController? passwordController;
  final String? emailError;
  final String? passwordError;
  final bool isLoading;
  final void Function(String email, String password)? onSignIn;
  final VoidCallback? onForgotPassword;
  final VoidCallback? onContinueWithGoogle;
  final VoidCallback? onContinueWithApple;
  final VoidCallback? onCreateAccount;

  const SignInScreen({
    super.key,
    this.emailController,
    this.passwordController,
    this.emailError,
    this.passwordError,
    this.isLoading = false,
    this.onSignIn,
    this.onForgotPassword,
    this.onContinueWithGoogle,
    this.onContinueWithApple,
    this.onCreateAccount,
  });

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  bool _obscure = true;
  late final TextEditingController _email = widget.emailController ?? TextEditingController();
  late final TextEditingController _password = widget.passwordController ?? TextEditingController();

  @override
  void dispose() {
    if (widget.emailController == null) _email.dispose();
    if (widget.passwordController == null) _password.dispose();
    super.dispose();
  }

  InputDecoration _deco(String label, {Widget? suffix, String? error}) => InputDecoration(
        labelText: label,
        errorText: error,
        suffixIcon: suffix,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: C.outline)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: C.outline)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: C.ink, width: 2)),
      );

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
                    const Text('Your money, at your pace.', style: T.display),
                    const SizedBox(height: 20),
                    const Text(
                      'Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.',
                      style: T.body,
                    ),
                    const SizedBox(height: 28),
                    TextField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      decoration: _deco('Email', error: widget.emailError),
                      style: const TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      style: const TextStyle(fontSize: 18),
                      decoration: _deco(
                        'Password',
                        error: widget.passwordError,
                        suffix: IconButton(
                          tooltip: _obscure ? 'Show password' : 'Hide password',
                          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Tap(
                        onTap: widget.onForgotPassword,
                        child: const Text('Forgot password?', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    PillButton(
                      widget.isLoading ? 'Signing in…' : 'Sign in',
                      onPressed: widget.isLoading ? null : () => widget.onSignIn?.call(_email.text, _password.text),
                    ),
                    const SizedBox(height: 22),
                    const Row(
                      children: [
                        Expanded(child: Divider(color: C.line)),
                        Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('or', style: T.sub)),
                        Expanded(child: Divider(color: C.line)),
                      ],
                    ),
                    const SizedBox(height: 22),
                    PillButton('Continue with Google', filled: false, onPressed: widget.onContinueWithGoogle),
                    const SizedBox(height: 16),
                    PillButton('Continue with Apple', filled: false, onPressed: widget.onContinueWithApple),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 4),
              child: Tap(
                onTap: widget.onCreateAccount,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('New to Pace?   ', style: TextStyle(fontSize: 16, color: C.muted)),
                    Text('Create account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
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
