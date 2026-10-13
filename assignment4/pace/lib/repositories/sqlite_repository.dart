import 'package:flutter/foundation.dart' show protected;
import 'package:sqflite/sqflite.dart' show Database;
import 'pace_database.dart' show PaceDatabase;

/// Base for repositories over the on-device SQLite database (database/schema.sql).
abstract class SqliteRepository {
  final PaceDatabase _database;
  SqliteRepository(this._database);

  /// The open database (opened on first use).
  @protected
  Future<Database> get db => _database.database;

  /// The INTEGER row id behind an app-level id string, or null if it can't be one.
  @protected
  int? rowId(String id) => int.tryParse(id);

  /// Runs [action] with [userId]'s row id; returns [orElse] instead when [userId] isn't a
  /// stored user's id (e.g. an account that only exists in memory).
  @protected
  Future<T> forUser<T>(String userId, {required T orElse, required Future<T> Function(Database db, int user) action}) async {
    final user = rowId(userId);
    if (user == null) return orElse;
    return action(await db, user);
  }
}
