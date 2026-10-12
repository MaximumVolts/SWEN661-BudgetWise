import 'dart:async' show StreamSubscription;
import 'package:flutter/foundation.dart' show ChangeNotifier, protected;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import '../models/navigation.dart' show FlowStep;
import 'app_navigator.dart' show AppNavigator;

enum ViewStatus { idle, loading, ready, error }

/// Base for all controllers (the "C" in MVCS).
/// - Holds screen state and exposes it to a View via [ChangeNotifier].
/// - Talks to Services; never imports a View or Flutter widgets.
abstract class BaseController extends ChangeNotifier {
  ViewStatus _status = ViewStatus.idle;
  Object? _error;
  Object? _actionError;
  bool _disposed = false;
  final _subscriptions = <StreamSubscription<Object?>>[];

  ViewStatus get status => _status;
  bool get isLoading => _status == ViewStatus.loading;
  bool get hasError => _status == ViewStatus.error;
  String? get errorMessage => _error == null ? null : messageFor(_error!);

  /// Transient failure of a user action (e.g. saving). The loaded screen stays visible;
  /// the View shows it once (snackbar) and then calls [clearActionError].
  String? get actionErrorMessage => _actionError == null ? null : messageFor(_actionError!);
  void clearActionError() => _actionError = null;

  /// A short confirmation of something the user just did (e.g. "Colorblind mode on"). The View
  /// shows it once (snackbar) and then calls [clearNotice].
  String? get notice => _notice;
  String? _notice;
  void clearNotice() => _notice = null;
  @protected
  void showNotice(String message) {
    _notice = message;
    notifyListeners();
  }

  static String messageFor(Object e) => e is AppException ? e.message : 'Something went wrong. Please try again.';

  /// Load the screen's data from services. Override and assign your state fields.
  @protected
  Future<void> fetch() async {}

  /// Initial load: shows the loading state.
  Future<void> load() => _run(showLoading: true);

  /// Reload in the background: keeps the current content on screen.
  Future<void> refresh() => _run(showLoading: false);

  Future<void> _run({required bool showLoading}) async {
    if (showLoading || _status != ViewStatus.ready) {
      _status = ViewStatus.loading;
      _error = null;
      notifyListeners();
    }
    try {
      await fetch();
      _status = ViewStatus.ready;
      _error = null;
    } catch (e) {
      if (_status == ViewStatus.ready) {
        _actionError = e; // background refresh failed: keep content
      } else {
        _status = ViewStatus.error;
        _error = e;
      }
    }
    notifyListeners();
  }

  /// Calls [onEvent] for every event of [events] until this controller is disposed.
  void listen<T>(Stream<T> events, void Function(T event) onEvent) => _subscriptions.add(events.listen((e) {
        if (!_disposed) onEvent(e);
      }));

  /// Reloads in the background whenever [events] emits (e.g. new bank data), until disposed.
  void refreshOn(Stream<Object?> events) => listen(events, (_) {
        if (!isLoading) refresh();
      });

  /// Runs a user action. Returns true on success; on failure records an action error.
  @protected
  Future<bool> perform(Future<void> Function() action) async {
    try {
      await action();
      return true;
    } catch (e) {
      _actionError = e;
      notifyListeners();
      return false;
    }
  }

  /// Runs a user action, then reloads the screen if it succeeded.
  @protected
  Future<void> performAndRefresh(Future<void> Function() action) async {
    await performAndRefresh(action);
  }

  /// Reloads the screen if [changed] (e.g. a dialog reporting that it saved something) is true.
  @protected
  Future<void> refreshIf(Future<bool> changed) async {
    if (await changed) await refresh();
  }

  @override
  void notifyListeners() {
    if (!_disposed) super.notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    for (final s in _subscriptions) {
      s.cancel();
    }
    super.dispose();
  }
}

/// Controller for a screen that can navigate (all except trivial ones).
abstract class ScreenController extends BaseController {
  final AppNavigator navigator;
  ScreenController(this.navigator);

  void back() => navigator.back();
  void openTab(int index) => navigator.openTab(index);
}

/// Controller for a screen with a form: one [submit] runs the service call while showing
/// [isSubmitting], and turns a FieldValidationException into per-field [fieldErrors].
abstract class FormController extends ScreenController {
  FormController(super.navigator);

  bool isSubmitting = false;
  /// Keyed by field (e.g. 'email', 'limit').
  Map<String, String> fieldErrors = const {};
  String? errorFor(String field) => fieldErrors[field];

  /// Runs [action] unless a submission is already running. Returns true when it succeeded; on a
  /// FieldValidationException the field errors are shown, other failures go to the action error.
  @protected
  Future<bool> submit(Future<void> Function() action) async {
    if (isSubmitting) return false;
    isSubmitting = true;
    fieldErrors = const {};
    notifyListeners();
    var valid = true;
    final ok = await perform(() async {
      try {
        await action();
      } on FieldValidationException catch (e) {
        fieldErrors = e.fieldErrors;
        valid = false;
      }
    });
    isSubmitting = false;
    notifyListeners();
    return ok && valid;
  }

  /// [submit] for a step of the sign-in / onboarding journey: goes to the step it returns.
  @protected
  Future<void> submitStep(Future<FlowStep?> Function() action) async {
    FlowStep? next;
    if (!await submit(() async => next = await action())) return;
    final step = next;
    if (step != null) navigator.openFlowStep(step);
  }
}
