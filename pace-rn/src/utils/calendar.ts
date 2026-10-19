/**
 * Day arithmetic on calendar dates. Adding 24-hour steps to a local date is wrong across
 * daylight-saving changes, so services use these.
 */

/** Midnight (local) of [d]'s date. */
export const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** [d]'s date moved by [days] calendar days (midnight, local). */
export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Whole calendar days from [from] to [to] (negative if [to] is earlier). */
export const daysBetween = (from: Date, to: Date) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86_400_000,
  );

/** First day of [d]'s month, moved by [months]. */
export const monthStart = (d: Date, months = 0) => new Date(d.getFullYear(), d.getMonth() + months, 1);

/** Days in [d]'s month. */
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/** 'YYYY-MM-DD' for [d]'s date. */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 'YYYY-MM' for [d]'s month. */
export const isoMonth = (d: Date) => isoDate(d).slice(0, 7);

/** A local date from 'YYYY-MM-DD' (or undefined). */
export function parseIsoDate(s: string | null | undefined): Date | undefined {
  const m = s ? /^(\d{4})-(\d{2})-(\d{2})/.exec(s) : null;
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
}

export const isBefore = (a: Date, b: Date) => a.getTime() < b.getTime();
export const isAfter = (a: Date, b: Date) => a.getTime() > b.getTime();
export const sameDay = (a: Date, b: Date) => daysBetween(a, b) === 0;
