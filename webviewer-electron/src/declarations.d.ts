/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />
declare module '*.css';

// Environment variables exposed by Vite through import.meta.env
interface ImportMetaEnv {
  readonly VITE_DEMO_KEY?: string;
}

