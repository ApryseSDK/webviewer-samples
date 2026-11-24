/**
 * @jest-environment node
 */
import { BrowserWindow, dialog, ipcMain } from 'electron';

jest.mock('electron', () => {
  const BrowserWindow = jest.fn(function BrowserWindow(this: Record<string, unknown>) {
    this.once = jest.fn();
    this.loadURL = jest.fn(async () => undefined);
    this.loadFile = jest.fn(async () => undefined);
    this.webContents = { openDevTools: jest.fn() };
  });

  return {
    app: {
      whenReady: jest.fn(async () => undefined),
      on: jest.fn(),
      quit: jest.fn(),
      getPath: jest.fn(() => '/documents'),
    },
    dialog: { showOpenDialog: jest.fn(), showSaveDialog: jest.fn() },
    ipcMain: { handle: jest.fn() },
    BrowserWindow: Object.assign(BrowserWindow, { getAllWindows: jest.fn(() => []) }),
  };
});

// Constants that Electron Forge's Vite plugin defines at build time.
const forgeGlobals = globalThis as Record<string, unknown>;

const loadMain = async () => {
  jest.isolateModules(() => {
    require('../../src/main');
  });
  // Let `app.whenReady()` resolve and the IPC handlers register.
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const getMainWindow = () => {
  return jest.mocked(BrowserWindow).mock.instances[0] as unknown as {
    loadURL: jest.Mock;
    loadFile: jest.Mock;
  };
};

describe('WebViewer Electron main process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL = 'http://localhost:5173';
    forgeGlobals.MAIN_WINDOW_VITE_NAME = 'main_window';
  });

  afterEach(() => {
    delete forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL;
    delete forgeGlobals.MAIN_WINDOW_VITE_NAME;
  });

  it('registers the file dialog IPC handlers', async () => {
    await loadMain();

    expect(ipcMain.handle).toHaveBeenCalledWith('dialog:openFile', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('dialog:saveFile', expect.any(Function));
  });

  it('creates a window that loads the Vite dev server URL', async () => {
    await loadMain();

    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        show: false,
        webPreferences: { preload: expect.stringMatching(/preload\.cjs$/) },
      }),
    );
    const mainWindow = getMainWindow();
    expect(mainWindow.loadURL).toHaveBeenCalledWith('http://localhost:5173');
    expect(mainWindow.loadFile).not.toHaveBeenCalled();
  });

  it('loads the built index.html when there is no dev server', async () => {
    forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL = undefined;
    await loadMain();

    const mainWindow = getMainWindow();
    expect(mainWindow.loadURL).not.toHaveBeenCalled();
    expect(mainWindow.loadFile).toHaveBeenCalledWith(
      expect.stringMatching(/renderer[\\/]main_window[\\/]index\.html$/),
    );
  });

});
