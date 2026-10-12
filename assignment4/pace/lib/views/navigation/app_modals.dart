import 'package:flutter/material.dart'
    show AlertDialog, BuildContext, EdgeInsets, Icon, Icons, ListTile, ListView, Navigator, Padding, SafeArea,
        ScaffoldMessenger, Semantics, SnackBar, Text, TextButton, showDialog, showModalBottomSheet;
import '../../models/transaction.dart' show FilterChoice, FilterKind;
import '../theme.dart' show C, T;

/// Dialogs, sheets and pickers that are not pages in the route stack.
/// Each returns true when something changed so the calling controller can refresh.
/// Implement this with your real forms; [DefaultAppModals] provides working
/// pickFilter / confirmDeleteAccount and "not implemented" stubs for the rest.
abstract class AppModals {
  Future<FilterChoice?> pickFilter(BuildContext context, FilterKind kind,
      {required List<FilterChoice> choices, FilterChoice? current});
  Future<bool> newCategory(BuildContext context);
  Future<bool> addNote(BuildContext context, String transactionId);
  Future<bool> addBill(BuildContext context);
  Future<bool> addGoal(BuildContext context);
  Future<bool> editGoal(BuildContext context, String goalId);
  Future<bool> addContribution(BuildContext context, String goalId);
  Future<bool> addExpectedIncome(BuildContext context);
  Future<bool> subscriptionMenu(BuildContext context, String subscriptionId);
  Future<bool> themePicker(BuildContext context);
  Future<bool> billReminderPicker(BuildContext context);
  Future<bool> confirmDeleteAccount(BuildContext context);
  Future<bool> confirmRemoveBankConnection(BuildContext context, String institutionName);
  Future<bool> confirmDeleteBudget(BuildContext context, String categoryName);
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

  @override
  Future<FilterChoice?> pickFilter(BuildContext context, FilterKind kind,
      {required List<FilterChoice> choices, FilterChoice? current}) {
    final title = switch (kind) { FilterKind.account => 'Account', FilterKind.category => 'Category', FilterKind.date => 'Date' };
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
              title: Text('All ${title.toLowerCase()}s'),
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
  Future<bool> confirmDeleteAccount(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete account?'),
        content: const Text('This permanently deletes your account and data. This can’t be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: C.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  @override
  Future<bool> confirmRemoveBankConnection(BuildContext context, String institutionName) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Remove $institutionName?'),
        content: const Text(
          'Pace will disconnect this Plaid test connection and delete its accounts from this phone. '
          'You can connect the test bank again any time.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: C.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  @override
  Future<bool> confirmDeleteBudget(BuildContext context, String categoryName) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete the $categoryName budget?'),
        content: const Text('Its monthly limit will be removed. Your transactions aren’t affected.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: C.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  @override
  Future<bool> newCategory(BuildContext c) => _todo(c, 'New category');
  @override
  Future<bool> addNote(BuildContext c, String id) => _todo(c, 'Add note');
  @override
  Future<bool> addBill(BuildContext c) => _todo(c, 'Add bill');
  @override
  Future<bool> addGoal(BuildContext c) => _todo(c, 'Add goal');
  @override
  Future<bool> editGoal(BuildContext c, String id) => _todo(c, 'Edit goal');
  @override
  Future<bool> addContribution(BuildContext c, String id) => _todo(c, 'Add contribution');
  @override
  Future<bool> addExpectedIncome(BuildContext c) => _todo(c, 'Add expected income');
  @override
  Future<bool> subscriptionMenu(BuildContext c, String id) => _todo(c, 'Subscription options');
  @override
  Future<bool> themePicker(BuildContext c) => _todo(c, 'Theme picker');
  @override
  Future<bool> billReminderPicker(BuildContext c) => _todo(c, 'Bill reminder picker');
  @override
  void menu(BuildContext c, String screenId) => _todo(c, 'Menu "$screenId"');
  @override
  void notImplemented(BuildContext c, String what) => _todo(c, what);
}
