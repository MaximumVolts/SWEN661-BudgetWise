import { AppException } from '../models/appException';
import { accountIn, type BankSnapshot, displayName, isLinked, signedAmount } from '../models/bankData';
import type { LinkedBankAccount } from '../models/linkedBank';
import { type Statement, STATEMENT_FORMAT_INFO, type StatementFormat, type StatementOptions } from '../models/statement';
import type { StatementSaver } from '../repositories/statementSaver';
import { categoriesOf } from './bankCategories';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import { isBefore, isoMonth } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { STATEMENT_ENCODERS } from './statementEncoders';

/**
 * Statements to download. BUSINESS RULES: which accounts and months can be exported, which
 * transactions a statement includes (posted ones in that month) and its totals, and the file name.
 */
export interface StatementService {
  /** The accounts (first: all, id '') and months (first: this month) on offer. Empty when no bank is linked. */
  options(): Promise<StatementOptions>;
  /** The statement for [accountId] ('' = all accounts) in [monthId] ('2026-10'). */
  statement(accountId: string, monthId: string): Promise<Statement>;
  /** Builds the statement as a [format] file and saves it. Returns the file name, or undefined if cancelled. */
  download(accountId: string, monthId: string, format: StatementFormat): Promise<string | undefined>;
}

export const MONTHS_OFFERED = 6;
const MONTH_ID = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** "Plaid Checking - 0000" (plain characters, so it reads well in any file format). */
const accountLabel = (a: LinkedBankAccount) => (a.mask ? `${a.name} - ${a.mask}` : a.name);

const accountName = (snap: BankSnapshot, accountId: string) => {
  const a = accountIn(snap, accountId);
  return a ? accountLabel(a) : '';
};

/** "pace-statement-2026-10-all-accounts.pdf", "pace-statement-2026-10-plaid-checking-0000.csv" */
export function statementFileName(s: Statement, format: StatementFormat): string {
  const slug = s.accountLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `pace-statement-${s.periodId}-${slug}.${STATEMENT_FORMAT_INFO[format].extension}`;
}

/**
 * [StatementService] over the linked banks' transactions from Plaid (sandbox).
 * BUSINESS RULES: the last MONTHS_OFFERED calendar months can be exported, per account or for all of
 * them; a statement lists the month's posted transactions (pending ones aren't final yet), oldest
 * first, with the user's categories and notes; money in / out are its totals.
 */
export class PlaidStatementService extends BankDataService implements StatementService {
  private readonly saver: StatementSaver;

  constructor(deps: BankServiceDeps & { saver: StatementSaver }) {
    super(deps);
    this.saver = deps.saver;
  }

  async options(): Promise<StatementOptions> {
    const snap = await this.bankData.load();
    if (!isLinked(snap)) return { accounts: [], months: [] };
    const now = this.currentDate();
    return {
      accounts: [
        { id: '', label: 'All accounts' },
        ...snap.accounts
          .filter((a) => snap.transactions.some((t, idx) => t.accountId === a.accountId))
          .map((a) => ({ id: a.accountId, label: accountLabel(a), idx: snap.transactions.findIndex((t) => t.accountId === a.accountId) })),
      ],
      months: Array.from({ length: MONTHS_OFFERED }, (_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { id: isoMonth(m), label: `${DateLabels.monthName(m.getMonth() + 1)} ${m.getFullYear()}` };
      }),
    };
  }

  async statement(accountId: string, monthId: string): Promise<Statement> {
    const m = MONTH_ID.exec(monthId);
    if (!m) throw new AppException(`"${monthId}" is not a month.`);
    const start = new Date(Number(m[1]), Number(m[2]) - 1, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    const snap = await this.bankData.load();
    if (!snap.transactionsReady && !snap.transactions.length) {
      throw new AppException("Your test bank's transactions are still loading. Try again in a few seconds.");
    }
    const account = accountId ? accountIn(snap, accountId) : undefined;
    if (accountId && !account) throw new AppException('That account is no longer linked.');

    const overrides = await this.overrides();
    const notes = await this.notes();
    const lines = snap.transactions
      .filter((t) => !t.pending && !isBefore(t.date, start) && isBefore(t.date, end) && (!account || t.accountId === accountId))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((t) => ({
        date: t.date,
        description: displayName(t),
        category: categoriesOf(t, overrides).map((c) => c.name).join(' + '),
        account: accountName(snap, t.accountId),
        amount: signedAmount(t),
        note: notes[t.transactionId] ?? '',
      }));
    return {
      accountLabel: account ? accountLabel(account) : 'All accounts',
      periodLabel: `${DateLabels.monthName(start.getMonth() + 1)} ${start.getFullYear()}`,
      periodId: monthId,
      generatedOn: this.currentDate(),
      lines,
      moneyIn: lines.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0),
      moneyOut: lines.filter((l) => l.amount < 0).reduce((s, l) => s - l.amount, 0),
    };
  }

  async download(accountId: string, monthId: string, format: StatementFormat) {
    const s = await this.statement(accountId, monthId);
    const file = {
      fileName: statementFileName(s, format),
      mimeType: STATEMENT_FORMAT_INFO[format].mimeType,
      format,
      content: STATEMENT_ENCODERS[format](s),
    };
    return (await this.saver.save(file)) ? file.fileName : undefined;
  }
}
