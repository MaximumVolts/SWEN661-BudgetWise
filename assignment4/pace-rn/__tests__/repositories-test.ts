import { memoryDatabase } from './support/memoryDatabase';
import { SqliteUserAccountRepository } from '@/repositories/userAccountRepository';
import { SqlitePreferencesRepository } from '@/repositories/preferencesRepository';
import { SqliteBudgetRepository } from '@/repositories/budgetRepository';
import { SqliteGoalRepository } from '@/repositories/goalRepository';
import { SqliteExpectedIncomeRepository } from '@/repositories/expectedIncomeRepository';
import { SqliteAnnotationRepository } from '@/repositories/annotationRepository';
import { SqliteLinkedBankRepository } from '@/repositories/linkedBankRepository';
import { SqlitePlaidKeyRepository } from '@/repositories/plaidKeyRepository';
import { SqliteRecurringExpenseRepository } from '@/repositories/recurringExpenseRepository';
import { InMemoryVault } from '@/repositories/secretVault';
import { DEFAULT_PREFERENCES, Reminder } from '@/models/userPreferences';
import { Frequency } from '@/models/recurring';
import { MIGRATIONS } from '@/repositories/schema';

describe('SQLite storage (the real schema)', () => {
  test('migrates to the latest version and keeps data across a restart', async () => {
    const first = await memoryDatabase();
    expect((await first.raw.getFirstAsync<{ user_version: number }>('PRAGMA user_version'))?.user_version).toBe(MIGRATIONS.length);
    const ada = await new SqliteUserAccountRepository(first.database).create({ username: 'Ada', passwordHash: 'h' });

    const restarted = await memoryDatabase(first.export()); // same file, opened again
    const users = new SqliteUserAccountRepository(restarted.database);
    expect((await users.fetchByUsername('ADA'))?.id).toBe(ada.id); // usernames ignore case
    expect(await users.fetchByUsername('bob')).toBeUndefined();
  });

  test('a new user gets default preferences; changes are kept, including reminders off', async () => {
    const { database } = await memoryDatabase();
    const ada = await new SqliteUserAccountRepository(database).create({ username: 'ada', passwordHash: 'h' });
    const prefs = new SqlitePreferencesRepository(database);
    expect(await prefs.load(ada.id)).toEqual(DEFAULT_PREFERENCES);
    await prefs.save(ada.id, { ...DEFAULT_PREFERENCES, highContrast: true, billReminder: Reminder.off });
    expect(await prefs.load(ada.id)).toEqual({ ...DEFAULT_PREFERENCES, highContrast: true, billReminder: Reminder.off });
  });

  test('budgets keep their order; replacing moves one to another category', async () => {
    const { database } = await memoryDatabase();
    const ada = await new SqliteUserAccountRepository(database).create({ username: 'ada', passwordHash: 'h' });
    const budgets = new SqliteBudgetRepository(database);
    await budgets.save(ada.id, 'food', 400);
    await budgets.save(ada.id, 'shopping', 250.5);
    await budgets.save(ada.id, 'food', 450); // update keeps its place
    expect([...(await budgets.limitsFor(ada.id))]).toEqual([['food', 450], ['shopping', 250.5]]);
    await budgets.replace(ada.id, 'food', 'travel', 300);
    expect([...(await budgets.limitsFor(ada.id))]).toEqual([['shopping', 250.5], ['travel', 300]]);
    await budgets.delete(ada.id, 'travel');
    expect([...(await budgets.limitsFor(ada.id)).keys()]).toEqual(['shopping']);
  });

  test("deleting a user deletes everything they own", async () => {
    const { database, raw } = await memoryDatabase();
    const users = new SqliteUserAccountRepository(database);
    const ada = await users.create({ username: 'ada', passwordHash: 'h' });
    const bob = await users.create({ username: 'bob', passwordHash: 'h' });
    const vault = new InMemoryVault();
    await new SqliteBudgetRepository(database).save(ada.id, 'food', 100);
    await new SqlitePlaidKeyRepository(database).save(ada.id, { clientId: 'c', sandboxSecret: 's' });
    await new SqliteGoalRepository(database).saveGoal(ada.id, {
      id: '', name: 'Trip', iconKey: 'car', target: 1000, saved: 0, contributions: [{ dateLabel: 'Oct 1', amount: 5 }],
    });
    await new SqliteExpectedIncomeRepository(database).add(ada.id, { id: '', name: 'Refund', amount: 50, date: new Date(2026, 9, 20) });
    await new SqliteRecurringExpenseRepository(database).save(ada.id, {
      id: '', name: 'Rent', amount: 900, frequency: Frequency.monthly, firstDue: new Date(2026, 9, 1), categoryId: 'utilities', kind: 'bill',
    });
    const annotations = new SqliteAnnotationRepository(database);
    await annotations.setNote(ada.id, 'tx1', 'Lunch');
    await annotations.setSubscriptionPaused(ada.id, 's1', true);
    await new SqliteLinkedBankRepository(database, vault).saveItem(
      { itemId: 'item-1', userId: ada.id, institutionName: 'Bank', accessToken: 'access-sandbox-1', sandboxCredentialsLabel: 'simple', linkedAt: new Date() },
      [{ accountId: 'a1', itemId: 'item-1', name: 'Checking', type: 'depository' }],
    );
    await new SqliteBudgetRepository(database).save(bob.id, 'food', 100);

    await users.delete(ada.id);
    for (const table of [
      'user_preferences', 'plaid_sandbox_keys', 'savings_goals', 'goal_contributions', 'expected_incomes',
      'recurring_expenses', 'transaction_annotations', 'recurring_stream_states', 'linked_items', 'linked_accounts',
    ]) {
      // Tables without a user_id column (contributions, accounts) only ever held Ada's rows.
      const rows = await raw.getAllAsync<{ user_id?: number }>(`SELECT * FROM ${table}`);
      expect(rows.filter((r) => r.user_id === undefined || String(r.user_id) !== bob.id)).toEqual([]);
    }
    expect((await new SqliteBudgetRepository(database).limitsFor(bob.id)).size).toBe(1); // Bob's are kept
  });

  test('linked banks: accounts and balances in the database, the access token in the secure vault', async () => {
    const { database, raw } = await memoryDatabase();
    const ada = await new SqliteUserAccountRepository(database).create({ username: 'ada', passwordHash: 'h' });
    const vault = new InMemoryVault();
    const banks = new SqliteLinkedBankRepository(database, vault);
    await banks.saveItem(
      { itemId: 'item-1', userId: ada.id, institutionId: 'ins_109508', institutionName: 'First Platypus Bank', accessToken: 'access-sandbox-secret', sandboxCredentialsLabel: 'simple', linkedAt: new Date(2026, 9, 12) },
      [{ accountId: 'a1', itemId: 'item-1', name: 'Plaid Checking', mask: '0000', type: 'depository', subtype: 'checking', currentBalance: 110.5, availableBalance: 100 }],
    );
    const [item] = await banks.itemsFor(ada.id);
    expect(item.accessToken).toBe('access-sandbox-secret');
    expect(JSON.stringify(await raw.getAllAsync('SELECT * FROM linked_items'))).not.toContain('access-sandbox');
    expect(await banks.accountsFor(ada.id)).toEqual([
      expect.objectContaining({ accountId: 'a1', currentBalance: 110.5, availableBalance: 100, mask: '0000' }),
    ]);
    await banks.deleteItem('item-1');
    expect(await banks.itemsFor(ada.id)).toEqual([]);
    expect(vault.values.size).toBe(0);
  });

  test('goals keep their contributions, newest first', async () => {
    const { database } = await memoryDatabase();
    const ada = await new SqliteUserAccountRepository(database).create({ username: 'ada', passwordHash: 'h' });
    const goals = new SqliteGoalRepository(database);
    const id = await goals.saveGoal(ada.id, {
      id: '', name: 'Trip', iconKey: 'car', target: 3000, saved: 650, targetDate: new Date(2027, 3, 1),
      contributions: [{ dateLabel: 'Oct 12', amount: 50 }, { dateLabel: 'Oct 1', amount: 100 }],
    });
    expect(await goals.fetchGoal(ada.id, id)).toEqual({
      id, name: 'Trip', iconKey: 'car', target: 3000, saved: 650, targetDate: new Date(2027, 3, 1),
      contributions: [{ dateLabel: 'Oct 12', amount: 50 }, { dateLabel: 'Oct 1', amount: 100 }],
    });
  });

  test('annotations: categories, notes, paid bills and paused subscriptions', async () => {
    const { database } = await memoryDatabase();
    const ada = await new SqliteUserAccountRepository(database).create({ username: 'ada', passwordHash: 'h' });
    const a = new SqliteAnnotationRepository(database);
    await a.setCategoryOverride(ada.id, 'tx1', ['food', 'travel']);
    await a.setNote(ada.id, 'tx1', 'Team lunch');
    await a.setNote(ada.id, 'tx2', 'Gift');
    await a.setNote(ada.id, 'tx2', ''); // removed
    await a.markBillPaid(ada.id, 's1', new Date(2026, 9, 5));
    await a.setSubscriptionPaused(ada.id, 's2', true);
    expect(await a.categoryOverrides(ada.id)).toEqual({ tx1: ['food', 'travel'] });
    expect(await a.notes(ada.id)).toEqual({ tx1: 'Team lunch' });
    expect([...(await a.paidBills(ada.id))]).toEqual([['s1', new Date(2026, 9, 5)]]);
    expect([...(await a.pausedSubscriptions(ada.id))]).toEqual(['s2']);
  });
});
