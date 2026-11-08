// Pace desktop: the Electron main process.
//
// The renderer is the Expo app's web build (`expo export -p web` → dist/), served from the
// privileged `app://pace/` scheme, or Expo's dev server when PACE_DEV_URL is set. The renderer is
// sandboxed with no Node access; the few things a browser can't do are done here and offered
// through the narrow bridge in preload.js:
//   • db:*         the app's SQLite database (node:sqlite, a file in the user-data folder)
//   • vault:*      Plaid access tokens, encrypted with the OS keychain (safeStorage)
//   • notify:*     bill reminders as system notifications
//   • statement:*  saving a statement (CSV, or HTML printed to PDF) through a Save dialog
//   • plaid:fetch  HTTPS POSTs to Plaid's sandbox (Plaid doesn't allow browser/CORS requests)
const { app, BrowserWindow, dialog, ipcMain, Menu, net, Notification, protocol, safeStorage, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { DatabaseSync } = require('node:sqlite');

const SCHEME = 'app';
const HOST = 'pace';
const APP_ORIGIN = `${SCHEME}://${HOST}`;
const DEV_URL = process.env.PACE_DEV_URL; // e.g. http://localhost:8081 (npm run desktop:dev)
// Packaged, the web build ships as a resources folder (not in app.asar: electron-builder drops the
// node_modules/ folders Metro puts exported assets under).
const DIST = app.isPackaged ? path.join(process.resourcesPath, 'dist') : path.resolve(__dirname, '..', 'dist');
const PLAID_SANDBOX = 'https://sandbox.plaid.com/';
const APP_ID = 'com.example.pace.desktop';

// Production content security policy. react-native-web injects <style> tags, hence 'unsafe-inline'
// for styles only. Scripts and every other request stay on the app's own origin.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
].join('; ');

protocol.registerSchemesAsPrivileged([{ scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

/** @type {BrowserWindow | undefined} */
let mainWindow;

// ── Serving the web build ────────────────────────────────────────────────────

/** dist/ files by URL path; unknown extension-less paths get index.html (single-page routing). */
async function serve(request) {
  const url = new URL(request.url);
  if (url.host !== HOST) return new Response('Not found', { status: 404 });
  let file = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (file !== DIST && !file.startsWith(DIST + path.sep)) return new Response('Not found', { status: 404 });
  if (!isFile(file)) {
    if (path.extname(file)) return new Response('Not found', { status: 404 });
    file = path.join(DIST, 'index.html');
  }
  const response = await net.fetch(pathToFileURL(file).toString());
  const headers = new Headers(response.headers);
  if (file.endsWith('.html')) headers.set('Content-Security-Policy', CSP);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(response.body, { status: response.status, headers });
}

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

// ── Database ─────────────────────────────────────────────────────────────────

/** @type {DatabaseSync | undefined} */
let db;
function database() {
  if (!db) {
    db = new DatabaseSync(path.join(app.getPath('userData'), 'pace.db'));
    db.exec('PRAGMA journal_mode = WAL');
  }
  return db;
}

const sqlParams = (params) => {
  if (params === undefined) return [];
  if (!Array.isArray(params) || !params.every((p) => p === null || typeof p === 'string' || typeof p === 'number')) {
    throw new TypeError('SQL parameters must be an array of strings, numbers or nulls');
  }
  return params;
};
const sqlText = (sql) => {
  if (typeof sql !== 'string') throw new TypeError('SQL must be a string');
  return sql;
};

// ── Secret vault ─────────────────────────────────────────────────────────────

const vaultFile = () => path.join(app.getPath('userData'), 'secrets.json');

function readVault() {
  try {
    return JSON.parse(fs.readFileSync(vaultFile(), 'utf8'));
  } catch {
    return {};
  }
}

function writeVault(values) {
  fs.writeFileSync(vaultFile(), JSON.stringify(values), { mode: 0o600 });
}

const vaultKey = (key) => {
  if (typeof key !== 'string' || !/^[A-Za-z0-9._-]{1,200}$/.test(key)) throw new TypeError('Invalid vault key');
  return key;
};

function requireEncryption() {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("This computer's secure storage isn't available, so Pace can't keep bank tokens safely.");
  }
}

// ── Notifications ────────────────────────────────────────────────────────────

// Node timers hold at most ~24.8 days; longer waits re-arm when they fire.
const MAX_TIMER_MS = 2 ** 31 - 1;
/** Scheduled reminders by id. They live while Pace runs; the app reschedules them on launch. */
const timers = new Map();

function showNotification({ title, body }) {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title: String(title), body: String(body) });
  n.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  n.show();
}

function scheduleNotification(n) {
  clearTimeout(timers.get(n.id));
  timers.delete(n.id);
  const wait = n.at - Date.now();
  if (!(wait > 0)) return; // already past
  timers.set(
    n.id,
    setTimeout(() => {
      timers.delete(n.id);
      if (n.at - Date.now() > 0) scheduleNotification(n);
      else showNotification(n);
    }, Math.min(wait, MAX_TIMER_MS)),
  );
}

const notification = (n) => {
  if (!n || !Number.isInteger(n.id) || typeof n.title !== 'string' || typeof n.body !== 'string') {
    throw new TypeError('Invalid notification');
  }
  return n;
};

// ── Statements ───────────────────────────────────────────────────────────────

async function saveStatement(file) {
  if (!file || typeof file.fileName !== 'string' || typeof file.content !== 'string' || !['csv', 'pdf'].includes(file.format)) {
    throw new TypeError('Invalid statement file');
  }
  const fileName = path.basename(file.fileName);
  const pdf = file.format === 'pdf';
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save statement',
    defaultPath: path.join(app.getPath('downloads'), fileName),
    filters: [pdf ? { name: 'PDF', extensions: ['pdf'] } : { name: 'CSV', extensions: ['csv'] }],
  });
  if (canceled || !filePath) return false;
  const data = pdf ? await printToPdf(file.content) : file.content;
  await fs.promises.writeFile(filePath, data);
  return true;
}

/** Prints [html] to PDF in a hidden, script-free window. */
async function printToPdf(html) {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false, contextIsolation: true } });
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    return await win.webContents.printToPDF({ printBackground: true, pageSize: 'Letter' });
  } finally {
    win.destroy();
  }
}

// ── Plaid sandbox requests ───────────────────────────────────────────────────

async function plaidFetch(url, init) {
  if (typeof url !== 'string' || !url.startsWith(PLAID_SANDBOX)) throw new Error('Only Plaid sandbox requests are allowed');
  if (!init || init.method !== 'POST' || typeof init.body !== 'string') throw new Error('Invalid Plaid request');
  const response = await net.fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: init.body,
    redirect: 'error',
  });
  return { status: response.status, text: await response.text() };
}

// ── IPC ──────────────────────────────────────────────────────────────────────

/** Only the app's own page (not some other page the window was sent to) may use the bridge. */
function fromApp(event) {
  const url = event.senderFrame?.url ?? '';
  return url.startsWith(`${APP_ORIGIN}/`) || (DEV_URL !== undefined && url.startsWith(DEV_URL));
}

function handle(channel, fn) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!fromApp(event)) throw new Error('Blocked: request did not come from Pace');
    return fn(...args);
  });
}

function registerIpc() {
  handle('db:exec', (sql) => void database().exec(sqlText(sql)));
  handle('db:run', (sql, params) => {
    const r = database().prepare(sqlText(sql)).run(...sqlParams(params));
    return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
  });
  handle('db:all', (sql, params) => database().prepare(sqlText(sql)).all(...sqlParams(params)).map((row) => ({ ...row })));
  handle('db:first', (sql, params) => {
    const row = database().prepare(sqlText(sql)).get(...sqlParams(params));
    return row ? { ...row } : null;
  });

  handle('vault:get', (key) => {
    const stored = readVault()[vaultKey(key)];
    if (stored === undefined) return undefined;
    requireEncryption();
    return safeStorage.decryptString(Buffer.from(stored, 'base64'));
  });
  handle('vault:set', (key, value) => {
    if (typeof value !== 'string') throw new TypeError('Vault values must be strings');
    requireEncryption();
    const values = readVault();
    values[vaultKey(key)] = safeStorage.encryptString(value).toString('base64');
    writeVault(values);
  });
  handle('vault:delete', (key) => {
    const values = readVault();
    delete values[vaultKey(key)];
    writeVault(values);
  });

  handle('notify:supported', () => Notification.isSupported());
  handle('notify:show', (n) => showNotification(notification(n)));
  handle('notify:schedule', (n) => {
    notification(n);
    if (typeof n.at !== 'number') throw new TypeError('Invalid notification time');
    scheduleNotification(n);
  });
  handle('notify:cancelAll', () => {
    for (const t of timers.values()) clearTimeout(t);
    timers.clear();
  });

  handle('statement:save', saveStatement);
  handle('plaid:fetch', plaidFetch);
}

// ── Window ───────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 600,
    title: 'Pace',
    backgroundColor: '#FFFFFF',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: true,
    },
  });
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => (mainWindow = undefined));

  const startUrl = DEV_URL ?? `${APP_ORIGIN}/`;
  const allowed = (url) => url.startsWith(DEV_URL ?? `${APP_ORIGIN}/`);

  // Links to the web (e.g. Plaid's docs) open in the browser; Pace never navigates away.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (allowed(url)) return;
    event.preventDefault();
    if (url.startsWith('https://')) void shell.openExternal(url);
  });

  void mainWindow.loadURL(startUrl);
}

/** Commands the menu can send to the app (src/models/shortcuts.ts: commandFromId). */
const SECTIONS = [
  ['home', 'Home'],
  ['transactions', 'Transactions'],
  ['spending', 'Spending'],
  ['budgets', 'Budgets'],
  ['bills', 'Bills'],
  ['comparison', 'Monthly Comparison'],
  ['goals', 'Savings goals'],
  ['cashFlow', 'Cash flow'],
  ['trends', 'Trends'],
];

/**
 * A menu item that runs one of the app's keyboard commands. The page handles the keys itself
 * (so they work in the dev server too), so the accelerator is only shown, not registered.
 */
function command(label, id, accelerator) {
  return {
    label,
    accelerator,
    registerAccelerator: false,
    click: () => mainWindow?.webContents.send('app:command', id),
  };
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  /** @type {Electron.MenuItemConstructorOptions[]} */
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        command('New…', 'new', 'CmdOrCtrl+N'),
        command('Save', 'save', 'CmdOrCtrl+S'),
        command('Print…', 'print', 'CmdOrCtrl+P'),
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'Go',
      submenu: [
        command('Back', 'back', isMac ? 'Cmd+[' : 'Alt+Left'),
        command('Forward', 'forward', isMac ? 'Cmd+]' : 'Alt+Right'),
        { type: 'separator' },
        command('Search…', 'search', 'CmdOrCtrl+K'),
        { type: 'separator' },
        ...SECTIONS.map(([id, label], i) => command(label, `section:${id}`, `CmdOrCtrl+${i + 1}`)),
        { type: 'separator' },
        command('Notifications', 'section:notifications'),
        command('Settings', 'section:settings', 'CmdOrCtrl+,'),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' }]),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [command('Keyboard Shortcuts', 'help', 'CmdOrCtrl+/')],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

app.whenReady().then(() => {
  // Windows shows notifications only for an app with an AppUserModelID.
  app.setAppUserModelId(app.isPackaged ? APP_ID : process.execPath);
  protocol.handle(SCHEME, serve);
  registerIpc();
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  for (const t of timers.values()) clearTimeout(t);
  db?.close();
});

// No other page may be loaded into a webview or new window.
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => event.preventDefault());
});
