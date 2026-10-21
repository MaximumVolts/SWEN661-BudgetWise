import '../models/statement.dart' show Statement, StatementFormat, StatementOptions;

/// Statements to download. BUSINESS RULES: which accounts and months can be exported, which
/// transactions a statement includes (posted ones in that month) and its totals, and the file name.
abstract class StatementService {
  /// The accounts (first: all of them, id '') and months (first: this month) on offer. Empty when
  /// no bank is linked.
  Future<StatementOptions> options();

  /// The statement for [accountId] ('' = all accounts) in [monthId] ('2026-10').
  Future<Statement> statement({required String accountId, required String monthId});

  /// Builds the statement as a [format] file and saves it where the user picks. Returns the file
  /// name, or null if the user cancelled the save.
  Future<String?> download({required String accountId, required String monthId, required StatementFormat format});
}
