// The only things the (sandboxed) renderer can ask the main process for. Exposed as
// `window.paceDesktop`; its TypeScript shape is src/repositories/desktop/desktopBridge.ts.
const { contextBridge, ipcRenderer } = require('electron');

const call = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('paceDesktop', {
  platform: process.platform,
  db: {
    exec: call('db:exec'),
    run: call('db:run'),
    all: call('db:all'),
    first: call('db:first'),
  },
  vault: {
    get: call('vault:get'),
    set: call('vault:set'),
    delete: call('vault:delete'),
  },
  notifications: {
    supported: call('notify:supported'),
    show: call('notify:show'),
    schedule: call('notify:schedule'),
    cancelAll: call('notify:cancelAll'),
  },
  saveStatement: call('statement:save'),
  plaidFetch: call('plaid:fetch'),
  /** Menu bar commands ('search', 'section:budgets'…). Returns the function that stops listening. */
  onCommand: (listener) => {
    const handler = (_event, id) => {
      if (typeof id === 'string') listener(id);
    };
    ipcRenderer.on('app:command', handler);
    return () => ipcRenderer.removeListener('app:command', handler);
  },
});
