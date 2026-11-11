// Starts Electron on desktop/main.js. Editors built on Electron (VS Code and others) can leave
// ELECTRON_RUN_AS_NODE=1 in the environment, which would make Electron run as plain Node, so it
// is removed here. Usage: node desktop/launch.js [--dev] [other Electron/Chromium switches]
const { spawn } = require('node:child_process');
const path = require('node:path');
const electron = require('electron'); // the path to the Electron binary when required from Node

const args = process.argv.slice(2);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
if (args.includes('--dev')) env.PACE_DEV_URL ??= 'http://localhost:8081';

const passThrough = args.filter((a) => a !== '--dev');
const child = spawn(electron, [path.join(__dirname, 'main.js'), ...passThrough], { stdio: 'inherit', env, windowsHide: false });
child.on('close', (code) => process.exit(code ?? 0));
