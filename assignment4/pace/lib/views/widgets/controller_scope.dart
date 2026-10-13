import 'package:flutter/material.dart'
    show BuildContext, Center, CircularProgressIndicator, Column, EdgeInsets, Icon, Icons, ListenableBuilder,
        MainAxisSize, Padding, SafeArea, Scaffold, ScaffoldMessenger, SizedBox, SnackBar, State, StatefulWidget,
        StatelessWidget, Text, TextAlign, VoidCallback, Widget, WidgetBuilder, WidgetsBinding;
import '../../controllers/base_controller.dart' show BaseController, ViewStatus;
import '../theme.dart' show C, T;
import 'widgets.dart' show PillButton;

/// Binds a View to its Controller (the "V ↔ C" link in MVCS).
/// - triggers `controller.load()` once (unless [autoLoad] is false),
/// - rebuilds on controller changes,
/// - renders loading / error (with retry) states,
/// - shows transient action errors as a snackbar,
/// - calls [builder] only when data is ready.
class ControllerScope<Ctl extends BaseController> extends StatefulWidget {
  final Ctl controller;
  final Widget Function(BuildContext context, Ctl controller) builder;
  final bool autoLoad;
  /// Dispose the controller with the view. Leave false if a parent / DI container owns it.
  final bool disposeController;
  final WidgetBuilder? loadingBuilder;
  final Widget Function(BuildContext context, String message, VoidCallback retry)? errorBuilder;

  const ControllerScope({
    super.key,
    required this.controller,
    required this.builder,
    this.autoLoad = true,
    this.disposeController = false,
    this.loadingBuilder,
    this.errorBuilder,
  });

  @override
  State<ControllerScope<Ctl>> createState() => _ControllerScopeState<Ctl>();
}

class _ControllerScopeState<Ctl extends BaseController> extends State<ControllerScope<Ctl>> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChanged);
    if (widget.autoLoad && widget.controller.status == ViewStatus.idle) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) widget.controller.load();
      });
    }
  }

  @override
  void didUpdateWidget(covariant ControllerScope<Ctl> old) {
    super.didUpdateWidget(old);
    if (old.controller != widget.controller) {
      old.controller.removeListener(_onChanged);
      widget.controller.addListener(_onChanged);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChanged);
    if (widget.disposeController) widget.controller.dispose();
    super.dispose();
  }

  void _onChanged() {
    if (!mounted) return;
    final c = widget.controller;
    final msg = c.actionErrorMessage ?? c.notice;
    if (msg == null) return;
    c
      ..clearActionError()
      ..clearNotice();
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.controller,
      builder: (context, _) {
        final c = widget.controller;
        final pending = widget.autoLoad && c.status == ViewStatus.idle;
        if (c.status == ViewStatus.loading || pending) {
          return widget.loadingBuilder?.call(context) ??
              Scaffold(body: Center(child: CircularProgressIndicator(color: C.ink, semanticsLabel: 'Loading')));
        }
        if (c.status == ViewStatus.error) {
          final retry = c.load;
          return widget.errorBuilder?.call(context, c.errorMessage ?? '', retry) ??
              Scaffold(
                body: SafeArea(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline, size: 40),
                          const SizedBox(height: 12),
                          Text(c.errorMessage ?? 'Something went wrong.', textAlign: TextAlign.center, style: T.body),
                          const SizedBox(height: 20),
                          SizedBox(width: 200, child: PillButton('Try again', onPressed: retry)),
                        ],
                      ),
                    ),
                  ),
                ),
              );
        }
        return widget.builder(context, c);
      },
    );
  }
}

/// Shown when a loaded controller has nothing to display (e.g. no periods yet).
class EmptyBody extends StatelessWidget {
  final String message;
  const EmptyBody({super.key, this.message = 'Nothing to show yet.'});
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: Text(message, style: T.body)));
}

/// Owns a controller's lifetime: disposes it when the page leaves the navigation stack.
/// Used by the router so each page gets exactly one controller.
class ControllerOwner extends StatefulWidget {
  final BaseController controller;
  final Widget child;
  const ControllerOwner({super.key, required this.controller, required this.child});

  @override
  State<ControllerOwner> createState() => _ControllerOwnerState();
}

class _ControllerOwnerState extends State<ControllerOwner> {
  @override
  void dispose() {
    widget.controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
