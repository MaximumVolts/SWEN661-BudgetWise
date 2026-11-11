import { ExpoDeviceNotifications } from '../repositories/deviceNotifications';
import { deviceDatabase } from '../repositories/expoDatabase';
import { SecureStoreVault } from '../repositories/secretVault';
import { ShareSheetStatementSaver } from '../repositories/statementSaver';
import { type AppServices, createAppServices } from './appServices';
import { nativePbkdf2 } from './nativePbkdf2';
import { PasswordHasher } from './passwordHasher';

/**
 * The services the app runs with on a phone or tablet: its own SQLite database, secure store,
 * share sheet and notifications, and native password hashing (pure-JavaScript PBKDF2 is far too
 * slow on Hermes). The desktop (Electron) app uses deviceServices.web.ts instead.
 */
export const createDeviceServices = (): AppServices =>
  createAppServices({
    database: deviceDatabase(),
    vault: new SecureStoreVault(),
    deviceNotifications: new ExpoDeviceNotifications(),
    statementSaver: new ShareSheetStatementSaver(),
    hasher: new PasswordHasher(undefined, nativePbkdf2),
  });
