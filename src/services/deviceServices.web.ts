import { desktopBridge } from '../repositories/desktop/desktopBridge';
import {
  DesktopNotifications,
  DesktopStatementSaver,
  DesktopVault,
  desktopDatabase,
  desktopFetch,
} from '../repositories/desktop/desktopRepositories';
import { type AppServices, createAppServices } from './appServices';
import { PasswordHasher } from './passwordHasher';
import { webCryptoPbkdf2 } from './pbkdf2';

/**
 * The services the desktop (Electron) app runs with: the web build talks to Electron's main
 * process for its SQLite file, OS-keychain secrets, system notifications, Save dialog and Plaid
 * requests (see desktop/main.js). Passwords are hashed with the browser's native WebCrypto.
 */
export const createDeviceServices = (): AppServices => {
  const bridge = desktopBridge();
  return createAppServices({
    database: desktopDatabase(bridge),
    vault: new DesktopVault(bridge),
    deviceNotifications: new DesktopNotifications(bridge),
    statementSaver: new DesktopStatementSaver(bridge),
    fetch: desktopFetch(bridge),
    hasher: new PasswordHasher(undefined, webCryptoPbkdf2),
  });
};
