/** Statements: a month of transactions for one account (or all of them), as a downloadable file. */

export type StatementFormat = 'pdf' | 'csv';

export const STATEMENT_FORMATS: StatementFormat[] = ['pdf', 'csv'];
export const STATEMENT_FORMAT_INFO: Record<StatementFormat, { label: string; extension: string; mimeType: string }> = {
  pdf: { label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' },
  csv: { label: 'CSV', extension: 'csv', mimeType: 'text/csv' },
};

/** Something the user can choose on the Statement export screen (an account or a month). */
export interface StatementChoice {
  id: string;
  label: string;
}

/** What can be exported: the accounts (first: all accounts) and the months (first: this month). */
export interface StatementOptions {
  accounts: StatementChoice[];
  months: StatementChoice[];
}

/** One transaction on a statement. [amount] uses the app's sign: negative = money out. */
export interface StatementLine {
  date: Date;
  description: string;
  category: string;
  account: string;
  amount: number;
  note: string;
}

/** A month of posted transactions, oldest first, with its totals. */
export interface Statement {
  accountLabel: string;
  periodLabel: string;
  /** For the file name, e.g. "2026-10". */
  periodId: string;
  generatedOn: Date;
  lines: StatementLine[];
  moneyIn: number;
  moneyOut: number;
}

/** Net of a statement: money in minus money out. */
export const statementNet = (s: Statement) => s.moneyIn - s.moneyOut;

/**
 * A statement ready to save. CSV is text; a PDF is described as HTML (printed to PDF on the
 * device), so it can be built and tested without native code.
 */
export interface StatementFile {
  fileName: string;
  mimeType: string;
  format: StatementFormat;
  /** CSV text, or the HTML to print as the PDF. */
  content: string;
}
