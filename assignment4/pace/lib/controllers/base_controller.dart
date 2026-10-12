import 'package:flutter/foundation.dart' show ChangeNotifier, protected;
import '../services/app_exception.dart' show AppException;
import '../services/app_navigator.dart' show AppNavigator;

enum ViewStatus { idle, loading, ready, error }

/// Base for all controllers (the "C" in MVCS).
/// - Holds screen state and exposes it to a View via [ChangeNotifier].
/// - Talks to Services; never imports a View or Flutter widgets.
abstract class BaseController extends ChangeNotifier {
  ViewStatus _status = ViewStatus.idle;
  Object? _error;
  Object? _actionError;
  bool _disposed = false;

  ViewStatus get status => _status;
  bool get isLoading => _status == ViewStatus.loading;
  bool get hasError => _status == ViewStatus.error;
  String? get errorMessage => _error == null ? null : messageFor(_error!);

  /// Transient failure of a user action (e.g. saving). The loaded screen stays visible;
  /// the View shows it once (snackbar) and then calls [clearActionError].
  String? get actionErrorMessage => _actionError == null ? null : messageFor(_actionError!);
  void clearActionError() => _actionError = null;

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

  @override
  void notifyListeners() {
    if (!_disposed) super.notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
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
