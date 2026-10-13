/// Recurring expenses: bills and subscriptions, whether the bank detected them or the user added
/// them.
library;

import 'transaction.dart' show CategoryInfo;

/// What kind of recurring expense it is.
enum RecurringKind {
  subscription('Subscription'),
  bill('Bill');

  const RecurringKind(this.label);
  final String label;
}

/// How often a recurring expense is paid. [code] is Plaid's name for it (also how it's stored).
enum RecurringFrequency {
  weekly('WEEKLY', 'Weekly', 'weekly'),
  biweekly('BIWEEKLY', 'Every 2 weeks', 'every 2 weeks'),
  semiMonthly('SEMI_MONTHLY', 'Twice a month', 'twice a month'),
  monthly('MONTHLY', 'Monthly', 'monthly'),
  yearly('ANNUALLY', 'Yearly', 'yearly'),
  unknown('UNKNOWN', 'Recurring', 'recurring');

  const RecurringFrequency(this.code, this.label, this.adverb);
  final String code;
  final String label;
  /// As in "$15.99 monthly".
  final String adverb;

  /// The frequencies a user can choose for an expense they add.
  static const choosable = [weekly, biweekly, monthly, yearly];

  static RecurringFrequency fromCode(String code) =>
      values.firstWhere((f) => f.code == code, orElse: () => unknown);
}

/// A recurring expense the user added themselves (rent paid by cheque, a yearly membership…).
class RecurringExpense {
  /// Empty for one that isn't saved yet.
  final String id;
  final String name;
  final double amount;
  final RecurringFrequency frequency;
  /// The first payment; later ones follow every [frequency].
  final DateTime firstDue;
  final String categoryId;
  final RecurringKind kind;
  const RecurringExpense({
    this.id = '',
    required this.name,
    required this.amount,
    required this.frequency,
    required this.firstDue,
    required this.categoryId,
    required this.kind,
  });

  RecurringExpense withId(String id) => RecurringExpense(
        id: id,
        name: name,
        amount: amount,
        frequency: frequency,
        firstDue: firstDue,
        categoryId: categoryId,
        kind: kind,
      );
}

/// What the user can do with a recurring expense from its menu.
enum RecurringAction { details, markPaid, pause, resume, edit, delete }

/// One recurring expense in full (the details page).
class BillDetailData {
  final String id;
  final String name;
  final String iconKey;
  final RecurringKind kind;
  /// True when the user added it (it can be edited / deleted); false when the bank detected it.
  final bool isManual;
  final bool isPaused;
  /// "$15.99 monthly"
  final String amountLabel;
  /// "$191.88 a year"
  final String yearlyLabel;
  /// "Next payment Oct 29", "Overdue · was due Oct 2", "Paused".
  final String nextLabel;
  final String categoryName;
  /// "Detected in Plaid Checking - 0000" / "Added by you".
  final String sourceLabel;
  /// e.g. "Price went up from $9.99 to $12.99", when the last charge differs from the one before.
  final String? priceChangeLabel;
  /// The next payment can be marked as paid.
  final bool canMarkPaid;
  /// Payments the bank matched to it, newest first (none for ones the user added).
  final List<BillPayment> history;
  const BillDetailData({
    required this.id,
    required this.name,
    required this.iconKey,
    required this.kind,
    required this.isManual,
    required this.isPaused,
    required this.amountLabel,
    required this.yearlyLabel,
    required this.nextLabel,
    required this.categoryName,
    required this.sourceLabel,
    this.priceChangeLabel,
    this.canMarkPaid = false,
    this.history = const [],
  });
}

/// One payment of a recurring expense, from the bank's transactions.
class BillPayment {
  final String transactionId;
  /// "Oct 3, 2026"
  final String dateLabel;
  /// The app's sign: negative = money out.
  final double amount;
  const BillPayment({required this.transactionId, required this.dateLabel, required this.amount});
}

/// The choices on the add / edit recurring expense form.
class RecurringFormOptions {
  final List<CategoryInfo> categories;
  final List<RecurringFrequency> frequencies;
  final List<RecurringKind> kinds;
  /// The expense being edited, if any.
  final RecurringExpense? editing;
  const RecurringFormOptions({required this.categories, required this.frequencies, required this.kinds, this.editing});
}
