import { isLinked, streamName } from '../models/bankData';
import { formatMoney } from '../models/money';
import type { TrendItem, TrendsData } from '../models/trend';
import { categoryById, primaryCategory } from './bankCategories';
import { BankDataService } from './bankDataService';
import { DateLabels } from '../utils/dateLabels';
import { spendingIn } from './spendingService';

export interface TrendService {
  getTrends(): Promise<TrendsData>;
  /**
   * The transactions behind trend [trendId]: a spending trend's category, or (for an income trend)
   * all transactions.
   */
  transactionFilterFor(trendId: string): { category?: string };
}

const THRESHOLD = 0.2;
/** Income trends' ids start with this; spending trends' ids are their category id. */
const INCOME_PREFIX = 'income-';
const MIN_DIFFERENCE = 10;

/**
 * [TrendService] spotting patterns in the linked banks' transactions from Plaid (sandbox).
 * BUSINESS RULES: a category is rising / falling when this month so far is 20%+ above / below the
 * same days of last month (and at least $10 apart); recurring income streams are "steady".
 */
export class PlaidTrendService extends BankDataService implements TrendService {
  transactionFilterFor(trendId: string): { category?: string } {
    return trendId.startsWith(INCOME_PREFIX) ? {} : { category: trendId };
  }

  async getTrends(): Promise<TrendsData> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const now = this.currentTime();
    const y = now.getFullYear();
    const m = now.getMonth();
    const lastStart = new Date(y, m - 1, 1);
    const thisMonth = DateLabels.monthName(m + 1);
    const lastMonth = DateLabels.monthName(lastStart.getMonth() + 1);

    const byCategory = (from: Date, to: Date) => {
      const out = new Map<string, number>();
      for (const t of spendingIn(snap, overrides, from, to)) {
        const id = primaryCategory(t, overrides).id;
        out.set(id, (out.get(id) ?? 0) + t.amount);
      }
      return out;
    };
    const current = byCategory(new Date(y, m, 1), new Date(y, m, now.getDate() + 1));
    const previous = byCategory(lastStart, new Date(y, m - 1, now.getDate() + 1));

    const trends: TrendItem[] = [];
    for (const id of new Set([...current.keys(), ...previous.keys()])) {
      const spent = current.get(id) ?? 0;
      const before = previous.get(id) ?? 0;
      if (Math.abs(spent - before) < MIN_DIFFERENCE) continue;
      const name = categoryById(id).name;
      const lower = name.toLowerCase();
      const compared = `${formatMoney(before)} over the same days in ${lastMonth}.`;
      if ((before > 0 && spent >= before * (1 + THRESHOLD)) || (before === 0 && spent > 0)) {
        trends.push({
          id,
          direction: 'rising',
          title: `${name} spending is going up`,
          body: `You've spent ${formatMoney(spent)} on ${lower} so far in ${thisMonth}, up from ${compared}`,
          actionLabel: 'View transactions',
        });
      } else if (spent <= before * (1 - THRESHOLD)) {
        trends.push({
          id,
          direction: 'falling',
          title: `${name} spending went down`,
          body: `You've spent ${formatMoney(spent)} on ${lower} so far in ${thisMonth}, down from ${compared}`,
          actionLabel: 'View transactions',
        });
      }
    }
    trends.sort((a, b) => (current.get(b.id) ?? 0) - (current.get(a.id) ?? 0));
    for (const s of snap.recurring.filter((x) => x.isInflow && x.isActive)) {
      trends.push({
        id: `${INCOME_PREFIX}${s.streamId}`,
        direction: 'steady',
        title: `${streamName(s)} is steady`,
        body: `About ${formatMoney(s.averageAmount)} arrives regularly${s.lastDate ? `, most recently on ${DateLabels.short(s.lastDate)}` : ''}.`,
        actionLabel: 'View deposits',
      });
    }

    return {
      headline: !isLinked(snap)
        ? 'Connect a bank to see trends'
        : trends.length
          ? `${trends.length} trend${trends.length === 1 ? '' : 's'} in your accounts`
          : 'No new trends in your accounts',
      trends,
      aboutText:
        "Trends compare this month so far with the same days last month, using your linked bank's transactions (Plaid Sandbox test data).",
    };
  }
}
