/**
 * @jest-environment node
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

type Handler = (...args: unknown[]) => Promise<unknown>;

// Constants that Electron Forge's Vite plugin defines at build time.
const forgeGlobals = globalThis as Record<string, unknown>;

const loadMain = async () => {
  jest.isolateModules(() => {
    require('../../src/main');
  });
  // Let `app.whenReady()` resolve and the IPC handlers register.
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const getHandler = (channel: string): Handler => {
  const call = jest.mocked(ipcMain.handle).mock.calls.find(([name]) => name === channel);
  if (!call) {
    throw new Error(`No handler registered for ${channel}`);
  }
  return call[1] as Handler;
};

const getMainWindow = () => {
  return jest.mocked(BrowserWindow).mock.instances[0] as unknown as {
    loadURL: jest.Mock;
    loadFile: jest.Mock;
  };
};

describe('WebViewer Electron main process', () => {
  let tempDir: string;

  beforeEach(() => {
    jest.clearAllMocks();
    forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL = 'http://localhost:5173';
    forgeGlobals.MAIN_WINDOW_VITE_NAME = 'main_window';
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webviewer-electron-'));
  });

  afterEach(() => {
    delete forgeGlobals.MAIN_WINDOW_VITE_DEV_SERVER_URL;
    delete forgeGlobals.MAIN_WINDOW_VITE_NAME;
    fs.rmSync(tempDir, { recursive: true, force: true });
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

  it('returns the name and contents of the selected file', async () => {
    const filePath = path.join(tempDir, 'sample.pdf');
    fs.writeFileSync(filePath, '%PDF-1.7');
    jest.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: false, filePaths: [filePath] });
    await loadMain();

    const file = (await getHandler('dialog:openFile')()) as { name: string; data: Buffer };

    expect(file.name).toBe('sample.pdf');
    expect(file.data.toString()).toBe('%PDF-1.7');
  });

  it('returns nothing when the open file dialog is canceled', async () => {
    jest.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] });
    await loadMain();

    await expect(getHandler('dialog:openFile')()).resolves.toBeUndefined();
  });

  it('suggests the document name as a PDF and writes to the chosen path', async () => {
    const savedPath = path.join(tempDir, 'renamed.pdf');
    jest.mocked(dialog.showSaveDialog).mockResolvedValue({ canceled: false, filePath: savedPath });
    await loadMain();

    await getHandler('dialog:saveFile')({}, new Uint8Array([37, 80, 68, 70]), 'report.docx');

    expect(dialog.showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPath: path.join('/documents', 'report.pdf') }),
    );
    expect(fs.readFileSync(savedPath, 'utf8')).toBe('%PDF');
  });

  it('does not write a file when the save dialog is canceled', async () => {
    jest.mocked(dialog.showSaveDialog).mockResolvedValue({ canceled: true, filePath: '' });
    const writeFile = jest.spyOn(fs.promises, 'writeFile');
    await loadMain();

    await getHandler('dialog:saveFile')({}, new Uint8Array([37, 80, 68, 70]), 'report.pdf');

    expect(writeFile).not.toHaveBeenCalled();
    writeFile.mockRestore();
  });
});
