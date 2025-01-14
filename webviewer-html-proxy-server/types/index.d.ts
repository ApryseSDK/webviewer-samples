import type { ServerConfigurationOptions } from './utils/types.js';
/**
 * This is a proxy solution to use with WebViewer-HTML that allows loading external HTML web pages so that HTML pages can be annotated.
 * See the npm package on {@link https://www.npmjs.com/package/@pdftron/webviewer-html-proxy-server @pdftron/webviewer-html-proxy-server} for more information.
 * @module @pdftron/webviewer-html-proxy-server
 */
/**
 * Initializes the proxy server to load external HTML pages.
 * @static
 * @alias module:@pdftron/webviewer-html-proxy-server.createServer
 * @param {object} options - The options objects containing SERVER_ROOT, PORT.
 * @param {string} options.SERVER_ROOT
 * Start the server on the specified host and port
 * @param {number} options.PORT
 * Start the server on the specified host and port
 * @param {cors.CorsOptions} [options.CORS_OPTIONS]
 * An object to configure CORS. See {@link https://expressjs.com/en/resources/middleware/cors.html}
 * @param {express.CookieOptions} [options.COOKIE_SETTING]
 * An object to configure COOKIE. See {@link https://expressjs.com/en/api.html#res.cookie}
 * @param {boolean} [options.ALLOW_POTENTIALLY_UNSAFE_URL]
 * Boolean containing value to disable URL validation. Setting this to true will override ALLOW_HTTP_PROXY.
 * @param {boolean} [options.ALLOW_HTTP_PROXY]
 * Boolean containing value to allow loading localhost files and for unsecured HTTP websites to be proxied.
 * @returns {void}
 * @example
 * const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');
   HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100
   });
 */
declare const createServer: ({ SERVER_ROOT, PORT, CORS_OPTIONS, COOKIE_SETTING, ALLOW_POTENTIALLY_UNSAFE_URL, ALLOW_HTTP_PROXY }: ServerConfigurationOptions) => void;
export { createServer };
