import { useTransactionsController } from '../controllers/transactionsController';
import { TransactionsScreen } from './screens/TransactionsScreen';

/**
 * 06 - Transactions: connects its controller to the screen. [category]: the starting filter (e.g.
 * from a trend); [search]: the starting search (e.g. from the desktop search box).
 */
export function TransactionsView({ category, search }: { category?: string; search?: string }) {
  return <TransactionsScreen controller={useTransactionsController(category, search)} />;
}
