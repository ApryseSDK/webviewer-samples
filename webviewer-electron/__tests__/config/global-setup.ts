import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { projectRoot } from './playwright.config';

const run = (command: string) => {
  execSync(command, { cwd: projectRoot, stdio: 'inherit' });
};

export default async function globalSetup() {
  // The Electron binary is downloaded by its install script, which is skipped
  // when dependencies are installed with `--ignore-scripts` (e.g. in CI).
  if (!fs.existsSync(path.join(projectRoot, 'node_modules/electron/path.txt'))) {
    run('node node_modules/electron/install.js');
  }

  // `npm start` copies the WebViewer assets into `lib/webviewer`; do the same here.
  run('npm run copy-webviewer');

  // Electron needs a display. On headless Linux (e.g. CI) start a virtual one.
  if (process.platform === 'linux' && !process.env.DISPLAY) {
    const display = ':99';
    const xvfb = spawn('Xvfb', [display, '-screen', '0', '1280x1024x24'], { stdio: 'ignore' });
    process.env.DISPLAY = display;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return () => {
      xvfb.kill();
    };
  }
}
