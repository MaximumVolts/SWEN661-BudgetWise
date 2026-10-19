import { compactMoney, formatMoney, signedMoney } from '../models/money';

/**
 * Display formatting for screens: they receive raw numbers and format them here. Money text itself
 * comes from models/money, shared with the services' pre-formatted labels.
 */
export const Fmt = {
  /** Shown in place of a value that wasn't provided. */
  missing: '--',
  money: (v: number, decimals = 2) => formatMoney(v, decimals),
  moneyOrMissing: (v: number | undefined, decimals = 2) => (v === undefined ? Fmt.missing : formatMoney(v, decimals)),
  signed: (v: number, decimals = 2) => signedMoney(v, decimals),
  /** What's left of a budget: "$40.00 left", or "$12.50 over" when [remaining] is negative. */
  leftOrOver: (remaining: number, decimals = 2) =>
    remaining >= 0 ? `${formatMoney(remaining, decimals)} left` : `${formatMoney(-remaining, decimals)} over`,
  percent: (v: number, decimals = 1) => `${v.toFixed(decimals)}%`,
  compact: compactMoney,
};
