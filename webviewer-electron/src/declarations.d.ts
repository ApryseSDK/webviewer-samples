/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />
declare module '*.css';

// Environment variables exposed by Vite through import.meta.env
interface ImportMetaEnv {
  readonly VITE_DEMO_KEY?: string;
}

// API exposed to the renderer by preload.ts
interface Window {
  electronAPI: {
    openFile: () => Promise<{ name: string; data: Uint8Array<ArrayBuffer> } | undefined>;
    saveFile: (arr: Uint8Array, fileName: string) => Promise<void>;
  };
}
