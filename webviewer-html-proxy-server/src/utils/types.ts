import type https from 'https';
import type http from 'http';
import type { RequestOptions, ServerOptions } from 'https';
import type { BrowserLaunchArgumentOptions, BrowserConnectOptions, LaunchOptions, Product } from 'puppeteer';
import type { CookieOptions } from 'express';
import type { CorsOptions } from 'cors';

export type ServerConfigurationOptions = {
  SERVER_ROOT: string;
  PORT: number;
  CORS_OPTIONS?: CorsOptions;
  COOKIE_SETTING?: CookieOptions;
  ALLOW_POTENTIALLY_UNSAFE_URL?: boolean;
  ALLOW_HTTP_PROXY?: boolean;
}

export type PuppeteerOptions = LaunchOptions & BrowserConnectOptions & BrowserLaunchArgumentOptions & {
  product?: Product;
  extraPrefsFirefox?: Record<string, unknown>;
}

export type PageDimensions = {
  width: number;
  height: number;
}

// declared locally from puppeteer but not exported
export interface Viewport extends PageDimensions {
  deviceScaleFactor?: number;
  isMobile?: boolean;
  isLandscape?: boolean;
  hasTouch?: boolean;
}

export type ServerHostPortSSL = {
  parsedHost: string;
  parsedPort: number;
  parsedSSL: typeof https | typeof http;
  pathname?: string;
}

export type ProxyRequestOptions = RequestOptions & ServerOptions;