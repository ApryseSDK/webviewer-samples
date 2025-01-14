/// <reference types="node" />
import type https from 'https';
import type http from 'http';
import type { RequestOptions, ServerOptions } from 'https';
import type { BrowserLaunchArgumentOptions, BrowserConnectOptions, LaunchOptions, Product } from 'puppeteer';
import type { CookieOptions } from 'express';
import type { CorsOptions } from 'cors';
export declare type ServerConfigurationOptions = {
    SERVER_ROOT: string;
    PORT: number;
    CORS_OPTIONS?: CorsOptions;
    COOKIE_SETTING?: CookieOptions;
    ALLOW_HTTP_PROXY?: boolean;
};
export declare type PuppeteerOptions = LaunchOptions & BrowserConnectOptions & BrowserLaunchArgumentOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export declare type PageDimensions = {
    width: number;
    height: number;
};
export interface Viewport extends PageDimensions {
    deviceScaleFactor?: number;
    isMobile?: boolean;
    isLandscape?: boolean;
    hasTouch?: boolean;
}
export declare type ServerHostPortSSL = {
    parsedHost: string;
    parsedPort: number;
    parsedSSL: typeof https | typeof http;
    pathname?: string;
};
export declare type ProxyRequestOptions = RequestOptions & ServerOptions;
