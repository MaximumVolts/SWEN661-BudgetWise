import 'dart:io' show Directory, File;
import 'package:flutter_test/flutter_test.dart'
    show contains, containsAll, expect, hasLength, isEmpty, isNot, isNotNull, isNull, setUp, setUpAll, startsWith, tearDown, test;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/sqlite_budget_repository.dart' show SqliteBudgetRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show Database, databaseFactoryFfi, sqfliteFfiInit;


import 'helpers.dart' show createAda, NoGoogle;
/// Reads the real database/schema.sql from the project, like the app's asset.
Future<String> loadFromProject(String asset) => File(asset).readAsString();
/// The user_preferences table as databases had it from v1 to v6 (with chart_patterns),
/// The user_preferences table as databases had it from v1 to v6 (chart_patterns, later colorblind_mode),
/// with its triggers, for the hand-built old databases below.
Future<void> addV1Preferences(Database db) async {
  await db.execute('''CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    high_contrast INTEGER NOT NULL DEFAULT 0 CHECK (high_contrast IN (0, 1)),
    chart_patterns INTEGER NOT NULL DEFAULT 1 CHECK (chart_patterns IN (0, 1)),
    show_chart_values INTEGER NOT NULL DEFAULT 1 CHECK (show_chart_values IN (0, 1)),
    budget_alerts INTEGER NOT NULL DEFAULT 1 CHECK (budget_alerts IN (0, 1)),
    bill_reminder_days INTEGER NOT NULL DEFAULT 3 CHECK (bill_reminder_days >= 0),
    income_type TEXT,
    onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')))''');
  await db.execute('''CREATE TRIGGER users_default_preferences AFTER INSERT ON users
    BEGIN INSERT INTO user_preferences (user_id) VALUES (NEW.id); END''');
  await db.execute('''CREATE TRIGGER user_preferences_touch AFTER UPDATE ON user_preferences
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN UPDATE user_preferences SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE user_id = NEW.user_id; END''');
}

void main() {
  late Directory dir;
  late String path;
  PaceDatabase openDb() => PaceDatabase(factory: databaseFactoryFfi, path: path, loadAsset: loadFromProject);

  setUpAll(sqfliteFfiInit);
  setUp(() {
    dir = Directory.systemTemp.createTempSync('pace_db_test');
    path = '${dir.path}/pace.db';
  });
  tearDown(() => dir.deleteSync(recursive: true));

  test('statement splitter keeps triggers whole and skips CLI-only lines', () async {
    final statements = PaceDatabase.statements(await loadFromProject(PaceDatabase.schemaAsset));
    final trigger = statements.firstWhere((s) => s.contains('TRIGGER users_default_preferences'));
    expect(trigger, contains('INSERT INTO user_preferences (user_id) VALUES (NEW.id);'));
    expect(trigger.endsWith('END'), true);
    expect(statements.any((s) => s.startsWith('PRAGMA') || s == 'BEGIN' || s == 'COMMIT'), false);
    expect(PaceDatabase.schemaVersion(await loadFromProject(PaceDatabase.schemaAsset)), 8);
  });

  test('first launch creates the database from schema.sql', () async {
    final pace = openDb();
    final db = await pace.database;
    expect((await db.rawQuery('PRAGMA user_version')).single.values.single, 8);
    final tables = [for (final r in await db.rawQuery("SELECT name FROM sqlite_master WHERE type='table'")) r['name']];
    expect(tables, contains('users'));
    expect(tables, contains('plaid_sandbox_test_credentials'));
    expect(tables, contains('budgets'));
    expect((await db.query('plaid_sandbox_test_credentials')).single['username'], 'user_good');
    await pace.close();
  });

  test('creating an account stores it in users (hashed) and survives a restart without recreating', () async {
    final first = openDb();
    final auth = RepositoryAuthService(
      accounts: SqliteUserAccountRepository(first),
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
    );
    expect(
      await createAda(auth),
      FlowStep.onboarding,
    );

    final db = await first.database;
    final row = (await db.query('users')).single;
    expect(row['email'], 'ada@example.com');
    expect(row['display_name'], 'Ada');
    expect(row['password_hash'] as String, startsWith('pbkdf2-sha256\$'));
    expect(row['password_hash'] as String, isNotNull);
    expect((row['security_answer_hash'] as String).contains('Rex'), false);
    // The schema's trigger gave the new user their default preferences.
    expect((await db.query('user_preferences', where: 'user_id = ?', whereArgs: [row['id']])).length, 1);
    await first.close();

    // "Restart": a new connection to the same file. Nothing is recreated or lost.
    final second = openDb();
    final restarted = RepositoryAuthService(
      accounts: SqliteUserAccountRepository(second),
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
    );
    expect(await restarted.signIn(email: 'ADA@example.com', password: 'secret123'), FlowStep.home);
    final db2 = await second.database;
    expect((await db2.query('users')).length, 1);
    expect((await db2.query('plaid_sandbox_test_credentials')).length, 1); // seed not re-inserted
    await second.close();
  });

  test('deleting an account removes its row and cascades to its preferences', () async {
    final pace = openDb();
    final repo = SqliteUserAccountRepository(pace);
    final account = await repo.create(email: 'bo@example.com', passwordHash: 'h');
    await repo.save(account.copyWith(googleId: 'g-1'));
    expect((await repo.fetchByGoogleId('g-1'))!.id, account.id);

    await repo.delete(account.id);
    expect(await repo.fetchById(account.id), isNull);
    final db = await pace.database;
    expect((await db.query('user_preferences')).length, 0);
    await pace.close();
  });

  test('an existing v2 database is rebuilt from schema.sql, keeping its data', () async {
    // Build a v2-era database (users without the credential columns) holding one user.
    final v2 = await databaseFactoryFfi.openDatabase(path);
    await v2.execute('''CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE COLLATE NOCASE,
      display_name TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')))''');
    await addV1Preferences(v2);
    await v2.insert('users', {'email': 'old@example.com', 'display_name': 'Old'});
    await v2.execute('PRAGMA user_version = 2');
    await v2.close();

    final pace = openDb();
    final db = await pace.database;
    expect((await db.rawQuery('PRAGMA user_version')).single.values.single, 8);
    expect(await db.query('budgets'), isEmpty); // a table the old database didn't have starts empty
    final repo = SqliteUserAccountRepository(pace);
    final old = (await repo.fetchByEmail('old@example.com'))!;
    expect(old.displayName, 'Old');
    expect(old.passwordHash, isNull);
    await repo.save(old.copyWith(passwordHash: 'h2'));
    expect((await repo.fetchByEmail('old@example.com'))!.passwordHash, 'h2');
    await pace.close();
  });

  test('upgrading v5 per-month budgets: one per category remains, the newest limit wins', () async {
    // A v5 database: budgets per month.
    final v5 = await databaseFactoryFfi.openDatabase(path);
    await v5.execute('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT)');
    await addV1Preferences(v5);
    await v5.execute('''CREATE TABLE budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      category_id TEXT NOT NULL,
      monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      UNIQUE (user_id, period, category_id))''');
    await v5.execute('CREATE INDEX idx_budgets_user_period ON budgets(user_id, period)');
    final user = await v5.insert('users', {'email': 'ada@example.com'});
    Future<void> budget(String period, String category, int cents, String updatedAt) => v5.insert('budgets', {
          'user_id': user, 'period': period, 'category_id': category, 'monthly_limit_cents': cents,
          'created_at': updatedAt, 'updated_at': updatedAt,
        });
    await budget('2026-09', 'food', 40000, '2026-09-02T10:00:00Z');
    await budget('2026-10', 'food', 45000, '2026-10-03T10:00:00Z'); // edited most recently: kept
    await budget('2026-09', 'travel', 60000, '2026-09-02T10:00:00Z');
    await v5.execute('PRAGMA user_version = 5');
    await v5.close();

    final pace = openDb();
    final db = await pace.database;
    expect((await db.rawQuery('PRAGMA user_version')).single.values.single, 8);
    final columns = [for (final c in await db.rawQuery('PRAGMA table_info(budgets)')) c['name']];
    expect(columns, isNot(contains('period')));
    final budgets = SqliteBudgetRepository(pace);
    expect(await budgets.limitsFor('$user'), {'food': 450.0, 'travel': 600.0});
    await pace.close();
  });

  test('a v4 database keeps its budgets when rebuilt', () async {
    final v4 = await databaseFactoryFfi.openDatabase(path);
    await v4.execute('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT)');
    await addV1Preferences(v4);
    await v4.execute('''CREATE TABLE budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL,
      monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      UNIQUE (user_id, category_id))''');
    await v4.execute('CREATE INDEX idx_budgets_user ON budgets(user_id)');
    final user = await v4.insert('users', {'email': 'ada@example.com'});
    await v4.insert('budgets', {'user_id': user, 'category_id': 'food', 'monthly_limit_cents': 100000});
    await v4.execute('PRAGMA user_version = 4');
    await v4.close();

    final pace = openDb();
    expect(await SqliteBudgetRepository(pace).limitsFor('$user'), {'food': 1000.0});
    await pace.close();
  });

  test('upgrading v6 preferences: removed chart_patterns is dropped, new colorblind_mode starts off, the rest is kept', () async {
    final v6 = await databaseFactoryFfi.openDatabase(path);
    await v6.execute('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT)');
    await addV1Preferences(v6);
    final user = await v6.insert('users', {'email': 'ada@example.com'}); // trigger adds the preferences row
    await v6.update('user_preferences', {'high_contrast': 1, 'chart_patterns': 1, 'budget_alerts': 0});
    await v6.execute('PRAGMA user_version = 6');
    await v6.close();

    final pace = openDb();
    final db = await pace.database;
    expect((await db.rawQuery('PRAGMA user_version')).single.values.single, 8);
    final columns = [for (final c in await db.rawQuery('PRAGMA table_info(user_preferences)')) c['name']];
    expect(columns, contains('colorblind_mode'));
    expect(columns, isNot(contains('chart_patterns')));
    final row = (await db.query('user_preferences', where: 'user_id = ?', whereArgs: [user])).single;
    expect(row['high_contrast'], 1);
    expect(row['budget_alerts'], 0);
    expect(row['colorblind_mode'], 0);
    // Both triggers are back: a new user gets a preferences row.
    final bo = await db.insert('users', {'email': 'bo@example.com'});
    expect(await db.query('user_preferences', where: 'user_id = ?', whereArgs: [bo]), hasLength(1));
    final triggers = [for (final t in await db.rawQuery("SELECT name FROM sqlite_master WHERE type = 'trigger'")) t['name']];
    expect(triggers, containsAll(['users_default_preferences', 'user_preferences_touch']));
    // Foreign keys are back on after the rebuild.
    expect((await db.rawQuery('PRAGMA foreign_keys')).single.values.single, 1);
    await pace.close();
  });
}
