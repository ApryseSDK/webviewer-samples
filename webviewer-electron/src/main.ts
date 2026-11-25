import { app, dialog, ipcMain, BrowserWindow, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

// Open file dialog handler
async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Documents", extensions: ["pdf", "docx", "pptx", "xlsx"] },
      { name: "Images", extensions: ["png", "jpg"] },
    ],
  });
  if (!canceled) {
    // Return the file contents rather than its path, since the renderer
    // can't fetch local file paths when it's served from the Vite dev server
    const filePath = filePaths[0];
    return {
      name: path.basename(filePath),
      data: await fs.promises.readFile(filePath),
    };
  }
}

// Save document file dialog handler
async function handleFileSave(_event: IpcMainInvokeEvent, arr: Uint8Array, fileName: string) {
  // The document is always saved as a PDF, so swap the original extension for .pdf
  const defaultName = `${path.parse(fileName || "document").name}.pdf`;
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save PDF",
    defaultPath: path.join(app.getPath("documents"), defaultName),
    filters: [
      {
        name: "PDF",
        extensions: ["pdf"],
      },
    ],
  });

  if (!canceled && filePath) {
    await fs.promises.writeFile(filePath, arr);
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Squirrel.Windows launches the app with one of these flags during setup.
function handleSquirrelEvent() {
  if (process.platform !== 'win32') {
    return false;
  }

  const squirrelEvent = process.argv[1];
  const runUpdate = (args: string[]) => {
    const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, { detached: true }).on('close', () => app.quit());
  };

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      runUpdate([`--createShortcut=${path.basename(process.execPath)}`]);
      return true;
    case '--squirrel-uninstall':
      runUpdate([`--removeShortcut=${path.basename(process.execPath)}`]);
      return true;
    case '--squirrel-obsolete':
      app.quit();
      return true;
    default:
      return false;
  }
}

if (handleSquirrelEvent()) {
  // Skip the rest of startup while Squirrel is installing/uninstalling
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // Hide the window until the page has painted to avoid showing a blank window
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  const loadPromise = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    : mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );

  loadPromise.catch((err: Error & { code?: string }) => {
    // In dev, Electron Forge's Vite plugin tells the renderer to reload after the
    // preload script builds, which aborts this first load. The reload succeeds,
    // so this error can be safely ignored.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL && err.code === 'ERR_ABORTED') {
      return;
    }
    console.error('Failed to load main window:', err);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(() => {
    // Add event listeners to handle file open and save
    ipcMain.handle('dialog:openFile', handleFileOpen);
    ipcMain.handle('dialog:saveFile', handleFileSave);

    // Create the main window
    createWindow();

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((err) => {
    console.error('Failed to initialize app:', err);
  });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.