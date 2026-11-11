/**
 * Pre-formatted date labels that services put into models (models carry labels, not dates, so
 * screens stay free of date formatting).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DateLabels = {
  /** 2026-10-09 -> Oct 9 */
  short: (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`,

  /** 2026-10-09 -> October 9, 2026 */
  long: (d: Date) => `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,

  /** 2026-10-09 -> Fri, Oct 9 */
  weekdayShort: (d: Date) => `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,

  /** 10 -> October (1-based month) */
  monthName: (month: number) => MONTH_NAMES[month - 1],

  /** 10 -> Oct (1-based month) */
  monthAbbr: (month: number) => MONTHS[month - 1],

  /** How long ago [then] was: "just now", "5 minutes ago", "2 hours ago", "Oct 9". */
  ago(then: Date, now: Date): string {
    const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return DateLabels.short(then);
  },
};
