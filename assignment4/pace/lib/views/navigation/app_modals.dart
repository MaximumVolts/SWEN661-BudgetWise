import 'package:flutter/material.dart'
    show AlertDialog, BuildContext, EdgeInsets, Icon, IconData, Icons, ListTile, ListView, Navigator, Padding, SafeArea,
        ScaffoldMessenger, Semantics, SnackBar, Text, TextButton, TextStyle, showDialog, showModalBottomSheet;
import '../../models/recurring.dart' show RecurringAction;
import '../../models/transaction.dart' show FilterChoice, FilterKind;
import '../../models/user_preferences.dart' show BillReminder;
import '../theme.dart' show C, T;

/// Dialogs, sheets and pickers that are not pages in the route stack.
/// Each returns true when something changed so the calling controller can refresh.
/// Implement this with your real forms; [DefaultAppModals] provides working
/// pickFilter / confirmations / the bill menu and "not implemented" stubs for the rest.
abstract class AppModals {
  Future<FilterChoice?> pickFilter(BuildContext context, FilterKind kind,
      {required List<FilterChoice> choices, FilterChoice? current});
  Future<bool> newCategory(BuildContext context);
  Future<bool> addNote(BuildContext context, String transactionId);
  Future<bool> editGoal(BuildContext context, String goalId);
  Future<bool> addContribution(BuildContext context, String goalId);
  Future<bool> confirmRemoveExpectedIncome(BuildContext context, String name);
  /// The menu for a bill or subscription: the user's pick among [actions], or null.
  Future<RecurringAction?> recurringMenu(BuildContext context, String name, List<RecurringAction> actions);
  Future<bool> themePicker(BuildContext context);
  /// When to be reminded about bills; null if dismissed.
  Future<BillReminder?> billReminderPicker(BuildContext context, BillReminder current);
  Future<bool> confirmDeleteAccount(BuildContext context);
  Future<bool> confirmRemoveBankConnection(BuildContext context, String institutionName);
  Future<bool> confirmDeleteBudget(BuildContext context, String categoryName);
  Future<bool> confirmDeleteRecurring(BuildContext context, String name);
  void menu(BuildContext context, String screenId);
  /// Tells the user [what] isn't built yet (used instead of opening a placeholder page).
  void notImplemented(BuildContext context, String what);
}

class DefaultAppModals implements AppModals {
  const DefaultAppModals();

  Future<bool> _todo(BuildContext context, String what) async {
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text('$what is not implemented yet.')));
    return false;
  }

  /// A yes / no question with a destructive [action] (shown in red). True if confirmed.
  Future<bool> _confirm(BuildContext context, {required String title, required String message, required String action}) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: C.red),
            child: Text(action),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  @override
  Future<FilterChoice?> pickFilter(BuildContext context, FilterKind kind,
      {required List<FilterChoice> choices, FilterChoice? current}) {
    final (title, all) = switch (kind) {
      FilterKind.account => ('Account', 'All accounts'),
      FilterKind.category => ('Category', 'All categories'),
      FilterKind.date => ('Date', 'Any date'),
    };
    return showModalBottomSheet<FilterChoice>(
      context: context,
      backgroundColor: C.bg,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (ctx) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            Semantics(
              header: true,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Text('Filter by ${title.toLowerCase()}', style: T.title),
              ),
            ),
            ListTile(
              title: Text(all),
              selected: current == null,
              trailing: current == null ? const Icon(Icons.check) : null,
              onTap: () => Navigator.of(ctx).pop(const FilterChoice(id: '', label: '')),
            ),
            for (final c in choices)
              ListTile(
                title: Text(c.label),
                selected: current?.id == c.id,
                trailing: current?.id == c.id ? const Icon(Icons.check) : null,
                onTap: () => Navigator.of(ctx).pop(c),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Future<RecurringAction?> recurringMenu(BuildContext context, String name, List<RecurringAction> actions) =>
      showModalBottomSheet<RecurringAction>(
        context: context,
        backgroundColor: C.bg,
        showDragHandle: true,
        builder: (ctx) => SafeArea(
          child: ListView(
            shrinkWrap: true,
            children: [
              Semantics(
                header: true,
                child: Padding(padding: const EdgeInsets.fromLTRB(24, 0, 24, 8), child: Text(name, style: T.title)),
              ),
              for (final a in actions)
                ListTile(
                  leading: Icon(_actionIcon(a), color: a == RecurringAction.delete ? C.red : null),
                  title: Text(_actionLabel(a), style: a == RecurringAction.delete ? TextStyle(color: C.red) : null),
                  onTap: () => Navigator.of(ctx).pop(a),
                ),
            ],
          ),
        ),
      );

  static String _actionLabel(RecurringAction a) => switch (a) {
        RecurringAction.details => 'View details',
        RecurringAction.markPaid => 'Mark next payment as paid',
        RecurringAction.pause => 'Pause tracking',
        RecurringAction.resume => 'Resume tracking',
        RecurringAction.edit => 'Edit',
        RecurringAction.delete => 'Delete',
      };

  static IconData _actionIcon(RecurringAction a) => switch (a) {
        RecurringAction.details => Icons.info_outline,
        RecurringAction.markPaid => Icons.check_circle_outline,
        RecurringAction.pause => Icons.pause_circle_outline,
        RecurringAction.resume => Icons.play_circle_outline,
        RecurringAction.edit => Icons.edit_outlined,
        RecurringAction.delete => Icons.delete_outline,
      };

  @override
  Future<bool> confirmDeleteAccount(BuildContext context) => _confirm(
        context,
        title: 'Delete account?',
        message: 'This permanently deletes your account and data. This can’t be undone.',
        action: 'Delete',
      );

  @override
  Future<bool> confirmRemoveBankConnection(BuildContext context, String institutionName) => _confirm(
        context,
        title: 'Remove $institutionName?',
        message: 'Pace will disconnect this Plaid test connection and delete its accounts from this phone. '
            'You can connect the test bank again any time.',
        action: 'Remove',
      );

  @override
  Future<bool> confirmDeleteBudget(BuildContext context, String categoryName) => _confirm(
        context,
        title: 'Delete the $categoryName budget?',
        message: 'Its monthly limit will be removed. Your transactions aren’t affected.',
        action: 'Delete',
      );

  @override
  Future<bool> confirmDeleteRecurring(BuildContext context, String name) => _confirm(
        context,
        title: 'Stop tracking $name?',
        message: 'It will be deleted from Pace. Nothing changes at your bank.',
        action: 'Delete',
      );

  @override
  Future<bool> confirmRemoveExpectedIncome(BuildContext context, String name) => _confirm(
        context,
        title: 'Remove $name?',
        message: 'It won’t count in your cash flow projection any more.',
        action: 'Remove',
      );

  @override
  Future<bool> newCategory(BuildContext c) => _todo(c, 'New category');
  @override
  Future<bool> addNote(BuildContext c, String id) => _todo(c, 'Add note');
  @override
  Future<bool> editGoal(BuildContext c, String id) => _todo(c, 'Edit goal');
  @override
  Future<bool> addContribution(BuildContext c, String id) => _todo(c, 'Add contribution');
  @override
  Future<bool> themePicker(BuildContext c) => _todo(c, 'Theme picker');
  @override
  Future<BillReminder?> billReminderPicker(BuildContext context, BillReminder current) =>
      showModalBottomSheet<BillReminder>(
        context: context,
        backgroundColor: C.bg,
        showDragHandle: true,
        isScrollControlled: true,
        builder: (ctx) => SafeArea(
          child: ListView(
            shrinkWrap: true,
            children: [
              Semantics(
                header: true,
                child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 0, 24, 4), child: Text('Remind me about bills', style: T.title)),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Text('As a notification on this phone at 9 AM, and in Notifications.', style: T.sub),
              ),
              for (final r in BillReminder.values)
                ListTile(
                  title: Text(r.label),
                  selected: r == current,
                  trailing: r == current ? const Icon(Icons.check) : null,
                  onTap: () => Navigator.of(ctx).pop(r),
                ),
            ],
          ),
        ),
      );
  @override
  void menu(BuildContext c, String screenId) => _todo(c, 'Menu "$screenId"');
  @override
  void notImplemented(BuildContext c, String what) => _todo(c, what);
}
