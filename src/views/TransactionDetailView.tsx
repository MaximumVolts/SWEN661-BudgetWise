import { useTransactionDetailController } from '../controllers/transactionDetailController';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';

/** 07 - Transaction detail: connects its controller to the screen. */
export function TransactionDetailView({ id }: { id: string }) {
  return <TransactionDetailScreen controller={useTransactionDetailController(id)} />;
}
