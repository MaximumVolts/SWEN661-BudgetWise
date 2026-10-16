/** Money as text, shared by services (pre-formatted labels) and screens. */

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 1234.5 -> $1,234.50 (negative values get a leading minus sign). */
export function formatMoney(v: number, decimals = 2): string {
  const fixed = Math.abs(v).toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  const negative = v < 0 && Number(fixed) !== 0;
  return `${negative ? '−' : ''}$${group(whole)}${decimals > 0 ? `.${frac}` : ''}`;
}

/** Always shows a sign: +$2,145.00 / −$40.00 */
export function signedMoney(v: number, decimals = 2): string {
  return `${v < 0 ? '−' : '+'}${formatMoney(Math.abs(v), decimals)}`;
}

/** 4000 -> $4k, 2500 -> $2.5k, 950 -> $950 */
export function compactMoney(v: number): string {
  if (Math.abs(v) >= 1000) {
    const k = v / 1000;
    return `$${k === Math.round(k) ? Math.round(k) : k.toFixed(1)}k`;
  }
  return `$${Math.round(v)}`;
}
