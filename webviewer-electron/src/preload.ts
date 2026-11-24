// oxlint-disable eslint-plugin-unicorn/no-empty-file
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron/renderer'

// Expose open and save file dialogs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (arr: Uint8Array, fileName: string) => ipcRenderer.invoke('dialog:saveFile', arr, fileName)
})
