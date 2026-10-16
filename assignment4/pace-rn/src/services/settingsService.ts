import type { SettingsData } from '../models/settings';
import { type BillReminder, DEFAULT_PREFERENCES, type UserPreferences } from '../models/userPreferences';
import { Emitter, type Subscribable } from '../utils/events';
import type { LinkedBankRepository } from '../repositories/linkedBankRepository';
import type { PreferencesRepository } from '../repositories/preferencesRepository';
import type { ProfileService } from './profileService';

export interface SettingsService {
  load(): Promise<SettingsData>;
  setHighContrast(value: boolean): Promise<void>;
  setColorblindMode(value: boolean): Promise<void>;
  setShowChartValues(value: boolean): Promise<void>;
  setBudgetAlerts(value: boolean): Promise<void>;
  /** When bill reminders come (in-app and push notifications), or Reminder.off. */
  setBillReminder(reminder: BillReminder): Promise<void>;
  /** Emits when data shown on Settings changed elsewhere (e.g. the profile was edited). */
  readonly changes: Subscribable;
  /** The preferences in effect now: the signed-in user's, or the defaults when signed out. */
  preferences(): Promise<UserPreferences>;
  /** Emits the preferences in effect whenever they change: a toggle, signing in, or signing out. */
  readonly preferenceChanges: Subscribable<UserPreferences>;
}

/**
 * [SettingsService] that stores each user's toggles via [PreferencesRepository] (on device).
 * BUSINESS RULES: preferences belong to the signed-in user; signed out, the defaults apply.
 */
export class RepositorySettingsService implements SettingsService {
  readonly preferenceChanges = new Emitter<UserPreferences>();
  private readonly profile: ProfileService;
  private readonly store: PreferencesRepository;
  private readonly banks: LinkedBankRepository;
  private readonly currentUserId: () => string | undefined;

  /** [signedInChanges]: AuthService.signedInChanges, so a new user's preferences take effect. */
  constructor(opts: {
    profile: ProfileService;
    store: PreferencesRepository;
    banks: LinkedBankRepository;
    currentUserId: () => string | undefined;
    signedInChanges?: Subscribable<boolean>;
  }) {
    this.profile = opts.profile;
    this.store = opts.store;
    this.banks = opts.banks;
    this.currentUserId = opts.currentUserId;
    opts.signedInChanges?.subscribe(async () => this.preferenceChanges.emit(await this.preferences()));
  }

  get changes() {
    return this.profile.changes;
  }

  async preferences() {
    const userId = this.currentUserId();
    return userId === undefined ? DEFAULT_PREFERENCES : this.store.load(userId);
  }

  async load(): Promise<SettingsData> {
    const me = await this.profile.load();
    const prefs = await this.preferences();
    const userId = this.currentUserId();
    const linkedAccounts = userId === undefined ? 0 : (await this.banks.accountsFor(userId)).length;
    return {
      name: me.name,
      username: me.username,
      initials: me.initials,
      connectedAccountCount: linkedAccounts,
      themeLabel: 'Light',
      billReminder: prefs.billReminder,
      highContrast: prefs.highContrast,
      colorblindMode: prefs.colorblindMode,
      showChartValues: prefs.showChartValues,
      budgetAlerts: prefs.budgetAlerts,
      footerLabel: 'PROTOTYPE · PLAID SANDBOX DATA',
    };
  }

  private async update(change: Partial<UserPreferences>) {
    const userId = this.currentUserId();
    if (userId === undefined) return;
    const next = { ...(await this.store.load(userId)), ...change };
    await this.store.save(userId, next);
    this.preferenceChanges.emit(next);
  }

  setHighContrast = (highContrast: boolean) => this.update({ highContrast });
  setColorblindMode = (colorblindMode: boolean) => this.update({ colorblindMode });
  setShowChartValues = (showChartValues: boolean) => this.update({ showChartValues });
  setBudgetAlerts = (budgetAlerts: boolean) => this.update({ budgetAlerts });
  setBillReminder = (billReminder: BillReminder) => this.update({ billReminder });
}
