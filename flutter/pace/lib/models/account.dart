/// Linked bank accounts.
library;

class LinkedAccount {
  final String id;
  final String name;
  final String subtitle; // "Checking •0000"
  final double balance;
  final String iconKey;
  final String syncLabel; // "Connected · synced 5 min ago"
  const LinkedAccount({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.balance,
    required this.iconKey,
    required this.syncLabel,
  });
}

class AccountGroup {
  final String title;
  final String institution;
  final List<LinkedAccount> accounts;
  const AccountGroup({required this.title, required this.institution, required this.accounts});
}

class ReconnectBanner {
  final String title;
  final String message;
  const ReconnectBanner({required this.title, required this.message});
}

class AccountsData {
  final ReconnectBanner? banner;
  final List<AccountGroup> groups;
  /// Shown instead of the list when [groups] is empty (e.g. "No bank connected yet…").
  final String? emptyMessage;
  const AccountsData({required this.groups, this.banner, this.emptyMessage});
}
