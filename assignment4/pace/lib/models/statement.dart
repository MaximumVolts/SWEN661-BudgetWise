/// Statements: a month of transactions for one account (or all of them), as a downloadable file.
library;

import 'dart:typed_data' show Uint8List;

/// The file formats a statement can be downloaded in.
enum StatementFormat {
  pdf('PDF', 'pdf', 'application/pdf'),
  csv('CSV', 'csv', 'text/csv');

  const StatementFormat(this.label, this.extension, this.mimeType);
  final String label;
  final String extension;
  final String mimeType;
}

/// Something the user can choose on the Statement export screen (an account or a month).
class StatementChoice {
  final String id;
  final String label;
  const StatementChoice({required this.id, required this.label});
}

/// What can be exported: the linked accounts (first: all accounts) and the months on offer
/// (first: the current month).
class StatementOptions {
  final List<StatementChoice> accounts;
  final List<StatementChoice> months;
  const StatementOptions({required this.accounts, required this.months});

  bool get isEmpty => accounts.isEmpty || months.isEmpty;
}

/// One transaction on a statement. [amount] uses the app's sign: negative = money out.
class StatementLine {
  final DateTime date;
  final String description;
  final String category;
  final String account;
  final double amount;
  final String note;
  const StatementLine({
    required this.date,
    required this.description,
    required this.category,
    required this.account,
    required this.amount,
    this.note = '',
  });
}

/// A month of posted transactions, oldest first, with its totals.
class Statement {
  final String accountLabel;
  final String periodLabel;
  /// For the file name, e.g. "2026-10".
  final String periodId;
  final DateTime generatedOn;
  final List<StatementLine> lines;
  final double moneyIn;
  final double moneyOut;
  const Statement({
    required this.accountLabel,
    required this.periodLabel,
    required this.periodId,
    required this.generatedOn,
    required this.lines,
    required this.moneyIn,
    required this.moneyOut,
  });

  double get net => moneyIn - moneyOut;
}

/// A statement encoded as a file, ready to save.
class StatementFile {
  final String fileName;
  final String mimeType;
  final Uint8List bytes;
  const StatementFile({required this.fileName, required this.mimeType, required this.bytes});
}
