import { Frequency, type RecurringFrequency } from '../models/recurring';
import { addDays, dateOnly, isBefore } from '../utils/calendar';

/** Date and cost arithmetic for recurring payments, shared by every service that projects them. */
export const RecurringSchedule = {
  /** How many payments a month, on average. */
  perMonth(f: RecurringFrequency): number {
    switch (f.code) {
      case 'WEEKLY':
        return 52 / 12;
      case 'BIWEEKLY':
        return 26 / 12;
      case 'SEMI_MONTHLY':
        return 2;
      case 'ANNUALLY':
        return 1 / 12;
      default:
        return 1;
    }
  },

  /** Roughly how many days between payments (for projections). */
  periodDays(f: RecurringFrequency): number {
    switch (f.code) {
      case 'WEEKLY':
        return 7;
      case 'BIWEEKLY':
        return 14;
      case 'SEMI_MONTHLY':
        return 15;
      case 'ANNUALLY':
        return 365;
      default:
        return 30;
    }
  },

  /**
   * The [n]th payment (0 = [first]), counted from [first] so monthly dates don't drift
   * (Jan 31 → Feb 28 → Mar 31).
   */
  occurrence(first: Date, f: RecurringFrequency, n: number): Date {
    if (f.code === Frequency.monthly.code || f.code === Frequency.unknown.code) return addMonths(first, n);
    if (f.code === Frequency.yearly.code) return addMonths(first, 12 * n);
    return addDays(dateOnly(first), n * RecurringSchedule.periodDays(f));
  },

  /** The first payment on or after [day], for payments starting on [first]. */
  firstOnOrAfter(first: Date, f: RecurringFrequency, day: Date): Date {
    let n = 0;
    let d = RecurringSchedule.occurrence(first, f, 0);
    while (isBefore(d, day) && n < 5000) d = RecurringSchedule.occurrence(first, f, ++n);
    return d;
  },
};

function addMonths(d: Date, months: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}
