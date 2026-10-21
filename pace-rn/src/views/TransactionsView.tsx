import { useTransactionsController } from '../controllers/transactionsController';
import { TransactionsScreen } from './screens/TransactionsScreen';

/** 06 - Transactions: connects its controller to the screen. [category]: the starting filter (e.g. from a trend). */
export function TransactionsView({ category }: { category?: string }) {
  return <TransactionsScreen controller={useTransactionsController(category)} />;
}
