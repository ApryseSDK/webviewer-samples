// Loaded into the Electron main process before the app (via `-r`) during e2e
// tests, so the sample runs without showing any windows on screen.
const { app } = require('electron');

app.on('browser-window-created', (_event, window) => {
  // The sample shows its window on `ready-to-show` and opens DevTools.
  window.show = () => {};
  window.showInactive = () => {};
  window.webContents.openDevTools = () => {};

  // Keep the hidden window rendering and running timers at full speed.
  window.webContents.setBackgroundThrottling(false);
});
