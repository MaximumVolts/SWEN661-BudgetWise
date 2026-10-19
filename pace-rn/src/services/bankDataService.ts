import type { AnnotationRepository } from '../repositories/annotationRepository';
import type { BankDataRepository } from '../repositories/bankDataRepository';
import type { CategoryOverrides } from './bankCategories';
import { dateOnly } from '../utils/calendar';

/** What every service computed from the linked banks' data needs. */
export interface BankServiceDeps {
  bankData: BankDataRepository;
  /** The user's own edits on top of bank data (categories, notes, paid bills, paused subscriptions). */
  annotations: AnnotationRepository;
  currentUserId: () => string | undefined;
  /** Injectable clock, so "today" can be fixed in tests. */
  now?: () => Date;
}

/**
 * Base for services whose answers are computed from the linked banks' data, applying the signed-in
 * user's annotations, with an injectable clock.
 */
export abstract class BankDataService {
  protected readonly bankData: BankDataRepository;
  protected readonly annotations: AnnotationRepository;
  protected readonly currentUserId: () => string | undefined;
  private readonly clock: () => Date;

  constructor(deps: BankServiceDeps) {
    this.bankData = deps.bankData;
    this.annotations = deps.annotations;
    this.currentUserId = deps.currentUserId;
    this.clock = deps.now ?? (() => new Date());
  }

  /** The current time (the injected clock). */
  protected currentTime(): Date {
    return this.clock();
  }

  /** Today's date, at midnight. */
  protected currentDate(): Date {
    return dateOnly(this.clock());
  }

  /** The signed-in user's category choices ({} when signed out). */
  protected async overrides(): Promise<CategoryOverrides> {
    const userId = this.currentUserId();
    return userId === undefined ? {} : this.annotations.categoryOverrides(userId);
  }

  /** The signed-in user's notes ({} when signed out). */
  protected async notes(): Promise<Record<string, string>> {
    const userId = this.currentUserId();
    return userId === undefined ? {} : this.annotations.notes(userId);
  }

  protected async paidBills(): Promise<Map<string, Date>> {
    const userId = this.currentUserId();
    return userId === undefined ? new Map() : this.annotations.paidBills(userId);
  }

  protected async pausedSubscriptions(): Promise<Set<string>> {
    const userId = this.currentUserId();
    return userId === undefined ? new Set() : this.annotations.pausedSubscriptions(userId);
  }
}
