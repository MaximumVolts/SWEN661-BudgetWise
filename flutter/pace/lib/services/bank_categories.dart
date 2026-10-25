import '../models/bank_data.dart' show BankTransaction;
import '../models/transaction.dart' show CategoryInfo;

/// Pace's categories, mapped from Plaid's personal_finance_category.primary values.
/// BUSINESS RULES: which Plaid categories count as everyday spending (transfers, card payments
/// and income don't, so money moving between your own accounts isn't counted twice).
class BankCategories {
  static const food = CategoryInfo(id: 'food', name: 'Food & drink', iconKey: 'food');
  static const shopping = CategoryInfo(id: 'shopping', name: 'Shopping', iconKey: 'shopping_bag');
  static const transport = CategoryInfo(id: 'transport', name: 'Transportation', iconKey: 'transit');
  static const travel = CategoryInfo(id: 'travel', name: 'Travel', iconKey: 'car');
  static const utilities = CategoryInfo(id: 'utilities', name: 'Rent & utilities', iconKey: 'utilities');
  static const personal = CategoryInfo(id: 'personal', name: 'Personal care', iconKey: 'fitness');
  static const entertainment = CategoryInfo(id: 'entertainment', name: 'Entertainment', iconKey: 'play');
  static const services = CategoryInfo(id: 'services', name: 'Services', iconKey: 'work');
  static const medical = CategoryInfo(id: 'medical', name: 'Medical', iconKey: 'shield');
  static const home = CategoryInfo(id: 'home', name: 'Home', iconKey: 'home');
  static const fees = CategoryInfo(id: 'fees', name: 'Bank fees', iconKey: 'bank');
  static const loans = CategoryInfo(id: 'loans', name: 'Loans', iconKey: 'bills');
  static const transfers = CategoryInfo(id: 'transfers', name: 'Transfers', iconKey: 'bank');
  static const income = CategoryInfo(id: 'income', name: 'Income', iconKey: 'payroll');
  static const other = CategoryInfo(id: 'other', name: 'Other', iconKey: 'store');

  static const all = [
    food, shopping, transport, travel, utilities, personal, entertainment,
    services, medical, home, fees, loans, transfers, income, other,
  ];

  static const _byPlaid = {
    'FOOD_AND_DRINK': food,
    'GENERAL_MERCHANDISE': shopping,
    'TRANSPORTATION': transport,
    'TRAVEL': travel,
    'RENT_AND_UTILITIES': utilities,
    'PERSONAL_CARE': personal,
    'ENTERTAINMENT': entertainment,
    'GENERAL_SERVICES': services,
    'GOVERNMENT_AND_NON_PROFIT': services,
    'MEDICAL': medical,
    'HOME_IMPROVEMENT': home,
    'BANK_FEES': fees,
    'LOAN_PAYMENTS': loans,
    'TRANSFER_OUT': transfers,
    'TRANSFER_IN': income,
    'INCOME': income,
  };

  /// Categories a budget can be set for (everyday spending).
  static List<CategoryInfo> get spendingCategories => [for (final c in all) if (!_notSpending.contains(c.id)) c];

  /// Categories that aren't everyday spending.
  static const _notSpending = {'loans', 'transfers', 'income'};

  static CategoryInfo forPlaid(String? primary) => _byPlaid[primary] ?? other;

  static CategoryInfo byId(String id) => all.firstWhere((c) => c.id == id, orElse: () => other);

  /// Every category on [t], primary first: the user's choices if they picked any, else Plaid's.
  static List<CategoryInfo> allOf(BankTransaction t, Map<String, List<String>> overrides) {
    final ids = overrides[t.transactionId];
    return (ids == null || ids.isEmpty) ? [forPlaid(t.categoryPrimary)] : [for (final id in ids) byId(id)];
  }

  /// [t]'s primary category: the one its full amount counts toward in spending, budgets and
  /// trends. Any other categories are labels for display and filtering only.
  static CategoryInfo of(BankTransaction t, Map<String, List<String>> overrides) => allOf(t, overrides).first;

  /// Whether [t] carries [categoryId] at all (primary or extra), for filtering.
  static bool has(BankTransaction t, Map<String, List<String>> overrides, String categoryId) =>
      allOf(t, overrides).any((c) => c.id == categoryId);

  /// Money out on everyday spending (not transfers, card/loan payments or income), judged by the
  /// primary category.
  static bool isSpending(BankTransaction t, Map<String, List<String>> overrides) =>
      t.amount > 0 && !_notSpending.contains(of(t, overrides).id);
}
