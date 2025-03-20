const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Documents", extensions: ["pdf", "docx", "pptx", "xlsx"] },
      { name: "Images", extensions: ["png", "jpg"] },
    ],
  });
  if (!canceled) {
    return filePaths[0]
  }
}

async function handleFileSave(event, arr) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select where you want to save the PDF",
    buttonLabel: "Save",
    filters: [
      {
        name: "PDF",
        extensions: ["pdf"],
      },
    ],
    properties: ["openDirectory"],
  });
  
  if (!canceled) {
    fs.writeFile(
      `${filePaths[0].toString()}/annotated.pdf`,
      arr,
      function (err) {
        if (err) throw err;
        console.log("Saved!");
      }
    );
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen);
  ipcMain.handle('dialog:saveFile', handleFileSave);
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
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
