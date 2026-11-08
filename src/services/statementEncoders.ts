import { signedMoney } from '../models/money';
import { type Statement, type StatementFormat, statementNet } from '../models/statement';
import { isoDate } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';

/** CSV columns. */
export const CSV_HEADER = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Note'];

/** Quotes a cell when it contains a comma, quote or line break (RFC 4180). */
const csvCell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/**
 * Spreadsheet-friendly CSV: one header row, then one row per transaction (oldest first), amounts as
 * plain numbers (negative = money out). Starts with a byte-order mark so Excel reads it as UTF-8.
 */
export function encodeCsv(s: Statement): string {
  const rows = [
    CSV_HEADER,
    ...s.lines.map((l) => [isoDate(l.date), l.description, l.category, l.account, l.amount.toFixed(2), l.note]),
  ];
  return `﻿${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * A printable statement (printed to PDF on the device): the account, month and totals, then a
 * table of the transactions.
 */
export function encodePdfHtml(s: Statement): string {
  const total = (label: string, amount: number) =>
    `<div class="total"><div class="label">${label.toUpperCase()}</div><div class="value">${escapeHtml(signedMoney(amount))}</div></div>`;
  const rows = s.lines
    .map(
      (l) =>
        `<tr><td>${isoDate(l.date)}</td><td>${escapeHtml(l.note ? `${l.description} (${l.note})` : l.description)}</td>` +
        `<td>${escapeHtml(l.category)}</td><td class="amount">${escapeHtml(signedMoney(l.amount))}</td></tr>`,
    )
    .join('');
  const table = s.lines.length
    ? `<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="amount">Amount</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted">No posted transactions this month.</p>';
  return `<!doctype html><html><head><meta charset="utf-8"><title>Pace statement · ${escapeHtml(s.accountLabel)} · ${escapeHtml(s.periodLabel)}</title>
<style>
@page { size: letter; margin: 40px; }
body { font-family: Helvetica, Arial, sans-serif; color: #1A1A1A; }
header { display: flex; justify-content: space-between; align-items: baseline; }
.brand { font-size: 20px; font-weight: bold; }
.muted { color: #5B5A55; }
h1 { font-size: 16px; margin: 16px 0 0; }
.totals { display: flex; margin: 14px 0 18px; }
.total { flex: 1; }
.label { font-size: 8px; color: #5B5A55; }
.value { font-size: 14px; font-weight: bold; }
table { width: 100%; border-collapse: collapse; font-size: 9px; }
th { background: #EEEEEE; text-align: left; padding: 4px; }
td { border-bottom: 0.5px solid #E0E0E0; padding: 4px; }
.amount { text-align: right; white-space: nowrap; }
footer { margin-top: 24px; font-size: 8px; color: #5B5A55; }
</style></head><body>
<header><span class="brand">Pace</span><span class="muted">Statement · ${escapeHtml(s.periodLabel)}</span></header>
<h1>${escapeHtml(s.accountLabel)}</h1>
<div class="muted">${escapeHtml(s.periodLabel)}</div>
<div class="totals">${total('Money in', s.moneyIn)}${total('Money out', -s.moneyOut)}${total('Net', statementNet(s))}</div>
${table}
<footer>Plaid sandbox test data · generated ${DateLabels.long(s.generatedOn)}</footer>
</body></html>`;
}

/** The encoder for each format. */
export const STATEMENT_ENCODERS: Record<StatementFormat, (s: Statement) => string> = {
  csv: encodeCsv,
  pdf: encodePdfHtml,
};
