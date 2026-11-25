/**
 * @jest-environment node
 */
import { contextBridge, ipcRenderer } from 'electron/renderer';

jest.mock(
  'electron/renderer',
  () => ({
    contextBridge: { exposeInMainWorld: jest.fn() },
    ipcRenderer: { invoke: jest.fn() },
  }),
  { virtual: true },
);

describe('WebViewer Electron preload script', () => {
  it('exposes the file dialog API to the renderer through IPC', () => {
    jest.isolateModules(() => {
      require('../../src/preload');
    });

    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electronAPI', {
      openFile: expect.any(Function),
      saveFile: expect.any(Function),
    });

    const api = jest.mocked(contextBridge.exposeInMainWorld).mock.calls[0][1] as Window['electronAPI'];

    void api.openFile();
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('dialog:openFile');

    const arr = new Uint8Array([1, 2, 3]);
    void api.saveFile(arr, 'sample.pdf');
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('dialog:saveFile', arr, 'sample.pdf');
  });
});
