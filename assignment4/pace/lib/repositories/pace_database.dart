import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart' as p show join;
import 'package:sqflite/sqflite.dart'
    show ConflictAlgorithm, Database, DatabaseException, DatabaseExecutor, DatabaseFactory, OpenDatabaseOptions, databaseFactory;

/// The app's on-device SQLite database, built from the bundled database/schema.sql.
///
/// Created ONCE, the first time it's needed: later launches open the existing file. schema.sql is
/// the only schema file: when its user_version is higher than the database's, the database is
/// rebuilt from it with the existing data carried over ([upgrade]).
class PaceDatabase {
  static const fileName = 'pace.db';
  static const schemaAsset = 'database/schema.sql';

  final DatabaseFactory? _factory;
  final String? _path;
  final Future<String> Function(String asset)? _loadAsset;

  /// [factory], [path] and [loadAsset] are for tests (e.g. FFI + a temporary file).
  PaceDatabase({DatabaseFactory? factory, String? path, Future<String> Function(String asset)? loadAsset})
      : _factory = factory,
        _path = path,
        _loadAsset = loadAsset;

  /// Opened on first use, so building the app's services never touches the disk or the plugin.
  late final Future<Database> database = _open();

  Future<String> _load(String asset) => (_loadAsset ?? rootBundle.loadString)(asset);

  Future<Database> _open() async {
    final factory = _factory ?? databaseFactory;
    final schema = await _load(schemaAsset);
    final version = schemaVersion(schema);
    final path = _path ?? p.join(await factory.getDatabasesPath(), fileName);
    return factory.openDatabase(
      path,
      options: OpenDatabaseOptions(
        version: version,
        // Only for a brand-new file.
        onCreate: (db, _) async {
          for (final statement in statements(schema)) {
            await db.execute(statement);
          }
        },
        // An older database is rebuilt from schema.sql with its data carried over (see [upgrade]).
        onUpgrade: (db, from, to) => upgrade(db, schema),
        onDowngrade: (db, from, to) =>
            throw StateError('Database is v$from but this build only knows v$to; refusing to downgrade.'),
        // Turned on here, after any upgrade: an upgrade runs in a transaction, where SQLite can't
        // switch foreign keys, and must be able to drop and refill tables freely.
        onOpen: (db) => db.execute('PRAGMA foreign_keys = ON'),
      ),
    );
  }

  /// Brings an existing database up to [schema] while keeping its data: reads every table, drops
  /// everything, runs schema.sql, then puts the rows back (oldest first) into the tables and
  /// columns that still exist. So:
  ///   * a new table starts empty, a new column gets its DEFAULT (give new NOT NULL columns one);
  ///   * a removed table or column, and a renamed one, loses its data;
  ///   * where a tightened UNIQUE constraint makes old rows collide, the newest row wins;
  ///   * a row that no longer fits a constraint (CHECK, NOT NULL) is skipped.
  /// Triggers are created after the data is back, so they don't fire for copied rows.
  static Future<void> upgrade(DatabaseExecutor db, String schema) async {
    Future<List<String>> names(String type) async => [
          for (final r in await db.rawQuery(
              "SELECT name FROM sqlite_master WHERE type = ? AND name NOT LIKE 'sqlite_%' ORDER BY rowid", [type]))
            r['name']! as String,
        ];

    final saved = <String, List<Map<String, Object?>>>{};
    for (final table in await names('table')) {
      try {
        saved[table] = await db.query(table, orderBy: 'rowid');
      } on DatabaseException {
        saved[table] = await db.query(table); // WITHOUT ROWID tables
      }
    }
    for (final trigger in await names('trigger')) {
      await db.execute('DROP TRIGGER IF EXISTS "$trigger"');
    }
    for (final view in await names('view')) {
      await db.execute('DROP VIEW IF EXISTS "$view"');
    }
    for (final table in saved.keys.toList().reversed) {
      await db.execute('DROP TABLE IF EXISTS "$table"'); // its indexes go with it
    }

    final all = statements(schema);
    final triggers = [for (final s in all) if (_isTrigger(s)) s];
    for (final s in all) {
      if (!_isTrigger(s)) await db.execute(s);
    }
    for (final table in await names('table')) {
      final rows = saved[table];
      if (rows == null || rows.isEmpty) continue;
      final columns = {for (final c in await db.rawQuery('PRAGMA table_info("$table")')) c['name']! as String};
      for (final row in rows) {
        final kept = {for (final e in row.entries) if (columns.contains(e.key)) e.key: e.value};
        if (kept.isEmpty) continue;
        try {
          await db.insert(table, kept, conflictAlgorithm: ConflictAlgorithm.replace);
        } on DatabaseException {
          // The row doesn't fit the new schema's constraints: dropped.
        }
      }
    }
    for (final t in triggers) {
      await db.execute(t);
    }
  }

  static bool _isTrigger(String statement) =>
      RegExp(r'^CREATE\s+(TEMP\s+|TEMPORARY\s+)?TRIGGER\b', caseSensitive: false).hasMatch(statement);

  Future<void> close() async => (await database).close();

  /// The `PRAGMA user_version = N` declared in [schema].
  static int schemaVersion(String schema) {
    final m = RegExp(r'PRAGMA\s+user_version\s*=\s*(\d+)', caseSensitive: false).firstMatch(schema);
    if (m == null) throw const FormatException('schema.sql must declare PRAGMA user_version');
    return int.parse(m[1]!);
  }

  /// Splits a .sql file into single statements for `execute` (which runs one at a time):
  /// strips `--` comments, keeps `CREATE TRIGGER … END;` bodies whole, and drops the
  /// PRAGMA / BEGIN / COMMIT lines meant for the sqlite3 CLI (the app sets user_version and
  /// runs each step in a transaction itself).
  static List<String> statements(String sql) {
    final out = <String>[];
    final current = StringBuffer();
    var inString = false;
    for (var i = 0; i < sql.length; i++) {
      final c = sql[i];
      if (!inString && c == '-' && i + 1 < sql.length && sql[i + 1] == '-') {
        while (i < sql.length && sql[i] != '\n') {
          i++;
        }
        current.write('\n');
        continue;
      }
      if (c == "'") inString = !inString;
      if (c == ';' && !inString) {
        final text = current.toString().trim();
        if (_isTrigger(text) &&!RegExp(r'\bEND$', caseSensitive: false).hasMatch(text)) {
          current.write(c); // a statement inside the trigger body
          continue;
        }
        if (text.isNotEmpty && !RegExp(r'^(PRAGMA|BEGIN|COMMIT)\b', caseSensitive: false).hasMatch(text)) {
          out.add(text);
        }
        current.clear();
        continue;
      }
      current.write(c);
    }
    if (current.toString().trim().isNotEmpty) out.add(current.toString().trim());
    return out;
  }
}
