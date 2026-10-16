import { useConnectBankController } from '../controllers/connectBankController';
import { ConnectBankScreen } from './screens/ConnectBankScreen';

/** 03 - Connect Bank: connects its controller to the screen. */
export function ConnectBankView() {
  return <ConnectBankScreen controller={useConnectBankController()} />;
}
