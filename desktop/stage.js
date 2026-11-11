// Stages the desktop app for electron-builder in build/desktop-app: the Electron main/preload
// scripts, the Expo web build (dist/) and the icon, with a minimal package.json. The main process
// uses only Electron and Node built-ins, so none of the React Native node_modules are packaged.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'build', 'desktop-app');
const pkg = require(path.join(root, 'package.json'));

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/index.html is missing: run `npm run desktop:export` first.');
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'desktop'), { recursive: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
for (const f of ['main.js', 'preload.js']) fs.copyFileSync(path.join(__dirname, f), path.join(out, 'desktop', f));
fs.copyFileSync(path.join(root, 'assets', 'icon.png'), path.join(out, 'assets', 'icon.png'));
fs.cpSync(path.join(root, 'dist'), path.join(out, 'dist'), { recursive: true });
fs.writeFileSync(
  path.join(out, 'package.json'),
  JSON.stringify(
    {
      name: 'pace-desktop',
      productName: 'Pace',
      version: pkg.version,
      description: 'Pace budgeting app for desktop',
      author: 'Team BudgetPros',
      license: 'MIT',
      main: 'desktop/main.js',
    },
    null,
    2,
  ),
);
console.log(`Staged desktop app in ${path.relative(root, out)}`);
