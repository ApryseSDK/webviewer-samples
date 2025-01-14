// import from node_modules
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import cookieParser from 'cookie-parser';
import nodeFetch from 'node-fetch';
import type { ClientRequest, IncomingMessage } from 'http';
import type { Request, Response } from 'express';
import { createLogger, format, transports } from 'winston';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Gunzip, createGunzip } from 'zlib';

// import from data types
import type { PageDimensions, ProxyRequestOptions, PuppeteerOptions, ServerConfigurationOptions, Viewport } from './utils/types.js';

// import from utils
import { isValidURL } from './utils/isValidURL';
import { getHostPortSSL } from './utils/getHostPortSSL';
import { isURLAbsolute, getCorrectHref } from './utils/isURLAbsolute';
import { getProxyFailedPage } from './utils/proxyFailedPage';

// import raw from assets
// @ts-ignore
import debounceJS from './assets/debounceJS.js';
// @ts-ignore
import shared from './assets/shared.js';
// @ts-ignore
import sendTextData from './assets/getTextData.js';
// @ts-ignore
import blockNavigation from './assets/blockNavigation.js';
// @ts-ignore
import linkPreview from './assets/linkPreview.js';
// @ts-ignore
import blockNavigationStyle from './assets/blockNavigation.css';
// @ts-ignore
import linkPreviewStyle from './assets/linkPreview.css';

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

const createServer = ({
  SERVER_ROOT,
  PORT,
  CORS_OPTIONS = { origin: `${SERVER_ROOT}:3000`, credentials: true },
  COOKIE_SETTING = {},
  ALLOW_POTENTIALLY_UNSAFE_URL = false,
  ALLOW_HTTP_PROXY = true
}: ServerConfigurationOptions): void => {
  const { align, colorize, combine, printf, timestamp } = format;
  const logger = createLogger({
    format: combine(
      timestamp({
        format: () => {
          return new Date().toLocaleString('en-US', {
            timeZone: 'America/Vancouver',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }
      }),
      align(),
      printf(
        ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`
      ),
      colorize({ all: true }),
    ),
    transports: [
      new transports.Console({
        format: combine(
          colorize()
        ),
      })
    ]
  });

  if (ALLOW_POTENTIALLY_UNSAFE_URL) {
    logger.warn('*** URL validation is now disabled. Beware of phishing attacks.');
  } else if (ALLOW_HTTP_PROXY) {
    logger.warn('*** Unsecured HTTP websites can now be proxied. Beware of ssrf attacks. See more here https://brightsec.com/blog/ssrf-server-side-request-forgery/');
  }

  const app = express();
  app.use(cookieParser());
  app.use(cors(CORS_OPTIONS));

  const PATH = `${SERVER_ROOT}:${PORT}`;

  const defaultViewport: Viewport = { width: 1440, height: 770 };
  const puppeteerOptions: PuppeteerOptions = {
    product: 'chrome',
    defaultViewport,
    headless: true,
    ignoreHTTPSErrors: false, // whether to ignore HTTPS errors during navigation
  };

  const defaultViewportHeightForVH = 1050;

  const regexForVhValue = /(\d+?)vh/g;

  app.get('/pdftron-proxy', async (req: Request, res: Response) => {
    // this is the url retrieved from the input
    const url = `${req.query.url}`;
    // ****** first check for malicious URLs
    if (!isValidURL(url, ALLOW_HTTP_PROXY, ALLOW_POTENTIALLY_UNSAFE_URL)) {
      res.status(400).send({ errorMessage: 'Please enter a valid URL and try again.' });
    } else {
      // ****** second check for puppeteer being able to goto url
      let browser: Browser;
      try {
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        const customHeaders = req.headers.customheaders;
        if (customHeaders) {
          const customHeadersObject = JSON.parse(`${customHeaders}`);
          await page.setExtraHTTPHeaders(customHeadersObject);
        }

        const pageHTTPResponse = await page.goto(url, {
          // use 'domcontentloaded' https://github.com/puppeteer/puppeteer/issues/1666
          waitUntil: 'domcontentloaded', // defaults to load
        });
        // https://github.com/puppeteer/puppeteer/issues/2479 pageHTTPResponse could be null
        const validUrl: string = pageHTTPResponse?.url() || url;

        // check again if puppeteer's validUrl will pass the test
        if (validUrl !== url && !isValidURL(validUrl, ALLOW_HTTP_PROXY, ALLOW_POTENTIALLY_UNSAFE_URL)) {
          res.status(400).send({ errorMessage: 'Please enter a valid URL and try again.' });
        } else {
          logger.info(`********** NEW REQUEST: ${validUrl}`);

          // cookie will only be set when res is sent succesfully
          const oneHour: number = 1000 * 60 * 60;
          res.cookie('pdftron_proxy_sid', validUrl, { ...COOKIE_SETTING, maxAge: oneHour });
          if (customHeaders) {
            res.cookie('pdftron_proxy_headers', `${customHeaders}`, { ...COOKIE_SETTING, maxAge: oneHour });
          }
          res.status(200).send({ validUrl });
        }
      } catch (err) {
        logger.error(`/pdftron-proxy ${url}`, err);
        res.status(400).send({ errorMessage: 'Please enter a valid URL and try again.' });
      } finally {
        try {
          await browser?.close();
        } catch (err) {
          logger.error(`/pdftron-proxy browser.close ${url}`, err);
        }
      }
    }
  });

  // need to be placed before app.use('/');
  app.get('/pdftron-download', async (req: Request, res: Response) => {
    const url = `${req.query.url}`;
    if (!isValidURL(url, ALLOW_HTTP_PROXY, ALLOW_POTENTIALLY_UNSAFE_URL)) {
      res.status(400).send({ errorMessage: 'Please enter a valid URL and try again.' });
    } else {
      logger.info(`********** DOWNLOAD: ${url}`);
      let browser: Browser;
      try {
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.goto(url, {
          waitUntil: 'domcontentloaded'
        });
        await page.waitForTimeout(2000);

        // Get the "viewport" of the page, as reported by the page.
        const pageDimensions: PageDimensions = await page.evaluate(() => {
          let sum = 0;
          // for some web pages, <html> and <body> have height: 100%
          // sum up the <body> children's height for an accurate page height
          document.body.childNodes.forEach((el: Element) => {
            if (el.nodeType === Node.ELEMENT_NODE) {
              const style = window.getComputedStyle(el);
              // filter hidden/collapsible elements
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || style.position === 'fixed' || style.position === 'absolute') {
                return;
              }
              // some elements have undefined clientHeight
              // favor scrollHeight since clientHeight does not include padding
              if (!isNaN(el.scrollHeight) && !isNaN(el.clientHeight)) {
                sum += (el.clientHeight > 0 ? (el.scrollHeight || el.clientHeight) : el.clientHeight);
              }
            }
          });
          const bodyHeight = document.body.scrollHeight || document.body.clientHeight || 0;
          const pageHeight = bodyHeight > 0 && bodyHeight > sum ? bodyHeight : sum;
          return {
            width: document.body.scrollWidth || document.body.clientWidth || 1440,
            // sum can be less than defaultViewport
            height: pageHeight > 770 ? pageHeight : 770,
          };
        });

        const buffer = await page.screenshot({ type: 'png', fullPage: true });
        res.setHeader('Cache-Control', ['no-cache', 'no-store', 'must-revalidate']);
        res.status(200).send({ buffer, pageDimensions });
      } catch (err) {
        logger.error(`/pdftron-download ${url}`, err);
        res.status(400).send({ errorMessage: 'Error taking screenshot from puppeteer' });
      } finally {
        try {
          await browser?.close();
        } catch (err) {
          logger.error(`/pdftron-download browser.close ${url}`, err);
        }
      }
    }
  });

  app.get('/pdftron-link-preview', async (req: Request, res: Response) => {
    const linkToPreview = `${req.query.url}`;

    try {
      const page = await nodeFetch(linkToPreview);
      const virtualConsole = new VirtualConsole();
      virtualConsole.on('error', () => {
        // No-op to skip console errors. https://github.com/jsdom/jsdom/issues/2230
      });
      const virtualDOM = new JSDOM(await page.text(), { virtualConsole });
      const { window } = virtualDOM;
      const { document } = window;

      const pageTitle: string = document.title;

      const faviconValidURLs: string[] = [];
      const faviconDataURLs: string[] = [];
      const getAllFaviconURLs = (selectors: string) => {
        document.querySelectorAll(selectors).forEach((el) => {
          if (el.getAttribute('href')) {
            // if favicon is a data URL, new URL() will return the same value
            const { href: absoluteFaviconURL } = new URL(el.getAttribute('href'), linkToPreview);
            // separate valid faviconURL and data faviconURL
            if (isURLAbsolute(absoluteFaviconURL)) {
              faviconValidURLs.push(absoluteFaviconURL);
            } else {
              faviconDataURLs.push(absoluteFaviconURL);
            }
          }
        });
      };
      // prioritize [rel="icon"] over [rel="shortcut icon"];
      getAllFaviconURLs('link[rel="icon"]');
      getAllFaviconURLs('link[rel="shortcut icon"]');
      const faviconUrl = faviconValidURLs[0] || faviconDataURLs[0] || '';

      const metaSelectors: NodeListOf<HTMLMetaElement> = document.querySelectorAll('meta[name="description"], meta[property="og:description"]');
      const metaDescription = metaSelectors.length > 0 ? (metaSelectors[0].content || '') : '';

      res.status(200).send({ pageTitle, faviconUrl, metaDescription });
    } catch (err) {
      logger.error(`node-fetch link-preview ${linkToPreview}`, err);
      res.sendStatus(400);
    }
  });

  // TODO: detect when websites cannot be fetched
  // // TAKEN FROM: https://stackoverflow.com/a/63602976
  app.use('/', (clientRequest: Request, clientResponse: Response) => {
    const cookiesUrl: string = clientRequest.cookies.pdftron_proxy_sid;
    const cookiesHeaders: string = clientRequest.cookies.pdftron_proxy_headers;
    const cookiesHeadersObject = cookiesHeaders ? JSON.parse(cookiesHeaders) : {};
    // logger.info(`Cookies ${cookiesUrl}`);
    // check again for all requests that go through the proxy server
    if (cookiesUrl && isValidURL(cookiesUrl, ALLOW_HTTP_PROXY, ALLOW_POTENTIALLY_UNSAFE_URL)) {
      const {
        parsedHost,
        parsedPort,
        parsedSSL,
        pathname
      } = getHostPortSSL(cookiesUrl, ALLOW_HTTP_PROXY);

      let newHostName = parsedHost;
      let newPath = clientRequest.url;

      const externalURL = newPath.split('/?external-proxy=')[1];
      if (externalURL) {
        const { hostname, href, origin, pathname: externalURLPathName } = new URL(externalURL);
        const hrefWithoutOrigin = href.split(origin)[1] || externalURLPathName;
        newHostName = hostname;
        newPath = hrefWithoutOrigin;
      }

      const options: ProxyRequestOptions = {
        hostname: newHostName,
        port: parsedPort,
        path: newPath,
        method: clientRequest.method,
        insecureHTTPParser: true,
        rejectUnauthorized: true, // verify the server's identity
        headers: {
          'User-Agent': clientRequest.headers['user-agent'],
          'Referer': `${PATH}${pathname}`,
          'Accept-Encoding': 'identity', // for amazon to work
          ...cookiesHeadersObject,
        }
      };

      const callback = (serverResponse: IncomingMessage, clientResponse: Response) => {
        // Delete 'x-frame-options': 'SAMEORIGIN'
        // so that the page can be loaded in an iframe
        // https://stackoverflow.com/questions/36628420/nodejs-request-hpe-invalid-header-token
        // https://stackoverflow.com/questions/56554244/hpe-invalid-header-token-while-trying-to-parse-api-response-using-express-js-rou
        delete serverResponse.headers['set-cookie'];
        delete serverResponse.headers['x-frame-options'];
        delete serverResponse.headers['content-security-policy'];
        serverResponse.headers['cross-origin-resource-policy'] = 'cross-origin';
        // 'require-corp' works fine on staging but doesn't on localhost: should use 'credentialless'
        serverResponse.headers['cross-origin-embedder-policy'] = 'credentialless';
        serverResponse.headers['access-control-allow-origin'] = '*';

        // reset cache-control for https://www.keytrudahcp.com
        serverResponse.headers['cache-control'] = 'max-age=0, public, no-cache, no-store, must-revalidate';
        let body = '';
        // Send html content from the proxied url to the browser so that it can spawn new requests.
        const serverResponseContentType = serverResponse.headers['content-type'];
        if (String(serverResponseContentType).indexOf('text/html') !== -1) {
          serverResponse.on('data', (chunk: string) => {
            body += chunk;
          });

          serverResponse.on('end', () => {
            const virtualConsole = new VirtualConsole();
            virtualConsole.on('error', () => {
              // No-op to skip console errors. https://github.com/jsdom/jsdom/issues/2230
            });

            const virtualDOM = new JSDOM(body, { virtualConsole });
            const { window } = virtualDOM;
            const { document } = window;
            document.documentElement.style.setProperty('--vh', `${defaultViewportHeightForVH * 0.01}px`);

            document.querySelectorAll('link').forEach((el) => {
              const href = el.getAttribute('href');
              if (!href) {
                return;
              }

              // filter only CSS links
              if (el.rel === 'stylesheet' || el.type === 'text/css' || href.endsWith('.css')) {
                if (!el.dataset.pdftron && isURLAbsolute(href)) {
                  // set this attibute to identify if <link> href has been modified
                  el.setAttribute('data-href', href);

                  const absoluteHref = getCorrectHref(href);
                  try {
                    const { hostname, href, origin, pathname } = new URL(absoluteHref);
                    // pathname doesn't include query and hash; use href.split(origin) to preserve everything
                    const hrefWithoutOrigin = href.split(origin)[1] || pathname;
                    el.setAttribute('data-domain', hostname);
                    // check if same domain with cookiesUrl
                    if (hostname === parsedHost) {
                      el.setAttribute('data-pdftron', 'same-domain');
                      el.setAttribute('href', hrefWithoutOrigin);
                    } else {
                      // external URLs
                      el.setAttribute('data-pdftron', 'different-domain');
                      el.setAttribute('href', `/?external-proxy=${absoluteHref}`);
                      // fix for github Failed to find a valid digest in the integrity attribute
                      if (el.getAttribute('integrity')) {
                        el.setAttribute('integrity', '');
                      }
                    }
                  } catch (e) {
                    logger.error(e);
                  }
                }
              }
            });

            // replace vh values in inline styles
            document.querySelectorAll('style').forEach((el) => {
              if (regexForVhValue.test(el.innerHTML)) {
                el.innerHTML = el.innerHTML.replace(regexForVhValue, 'calc($1 * var(--vh))');
              }
            });

            const traverseNode = (parentNode: HTMLElement) => {
              parentNode.childNodes.forEach((child: HTMLElement) => {
                // Node.ELEMENT_NODE = 1; Node.TEXT_NODE = 3
                if (child.nodeType === 1) {
                  // var(--vh) doesn't work in JSDOM
                  if (child.style.height && regexForVhValue.test(child.style.height)) {
                    child.style.height = child.style.height.replace(regexForVhValue, '$10px');
                  }
                  if (child.style.minHeight && regexForVhValue.test(child.style.minHeight)) {
                    child.style.minHeight = child.style.minHeight.replace(regexForVhValue, '$10px');
                  }
                }

                if (child.nodeType !== 3) {
                  traverseNode(child);
                }
              });
            };

            traverseNode(document.body);

            let newBody = virtualDOM.serialize();

            const styleTag = `
              <style type='text/css' id='pdftron-css'>${blockNavigationStyle}</style>
              <style type='text/css'>${linkPreviewStyle}</style>
            `;
            const globalVarsScript = `<script type='text/javascript' id='pdftron-js'>window.PDFTron = {}; window.PDFTron.urlToProxy = '${cookiesUrl}';</script>`;
            const scriptTags = `
              <script type='text/javascript'>${debounceJS}</script>
              <script type='text/javascript'>${shared}</script>
              <script type='text/javascript'>${blockNavigation}</script>
              <script type='text/javascript'>${linkPreview}</script>
              <script type='text/javascript'>${sendTextData}</script>
            `;

            const headIndex: number = newBody.indexOf('</head>');
            if (headIndex > 0) {
              if (!/pdftron-css/.test(newBody.substring(0, headIndex))) {
                newBody = newBody.slice(0, headIndex) + styleTag + newBody.slice(headIndex);
              }

              if (!/pdftron-js/.test(newBody.substring(0, headIndex))) {
                // order: declare global var first, then debounce, then blocknavigation (switching all href) then send text/link data since the latter happens over and over again
                newBody = newBody.slice(0, headIndex) + globalVarsScript + scriptTags + newBody.slice(headIndex);
              }
            }

            delete serverResponse.headers['content-length'];
            clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
            clientResponse.end(newBody);
          });

          serverResponse.on('error', (e) => {
            logger.error(e);
          });
        } else if (String(serverResponseContentType).indexOf('text/css') !== -1) {
          let cssContent = '';
          let externalResponse: IncomingMessage | Gunzip = serverResponse;
          const contentEncoding = serverResponse.headers['content-encoding'];

          // https://stackoverflow.com/questions/62505328/decode-gzip-response-on-node-js-man-in-the-middle-proxy
          if (contentEncoding?.toLowerCase().includes('gzip')) {
            delete serverResponse.headers['content-encoding'];
            externalResponse = createGunzip();
            serverResponse.pipe(externalResponse);
          }

          externalResponse.on('data', (chunk: string) => {
            cssContent += chunk;
          });

          externalResponse.on('end', () => {
            if (regexForVhValue.test(cssContent)) {
              cssContent = cssContent.replace(regexForVhValue, 'calc($1 * var(--vh))');
              // need to update content-length after swapping vh values, only for gzip response
              if (contentEncoding?.toLowerCase().includes('gzip')) {
                serverResponse.headers['content-length'] = `${cssContent.length}`;
              } else {
                delete serverResponse.headers['content-length'];
              }
            }
            // write will only append to existing clientResponse and needed to be piped
            // use writeHead and end for http response
            // use send for express response
            clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers).end(cssContent);
            // clientResponse.set(serverResponse.headers).send(cssContent);
          });

          externalResponse.on('error', (e) => {
            logger.error(e);
          });
        } else {
          // Pipe the server response from the proxied url to the browser so that new requests can be spawned for non-html content (js/css/json etc.)
          serverResponse.pipe(clientResponse, {
            end: true,
          });
          // Can be undefined
          if (serverResponseContentType) {
            clientResponse.contentType(serverResponseContentType);
          }
        }
      };

      const serverRequest: ClientRequest = parsedSSL.request(options, (serverResponse) => {
        // No need to check for redirects. Puppeteer will make sure final validURL exists
        callback(serverResponse, clientResponse);
      });

      serverRequest.on('error', (e: NodeJS.ErrnoException) => {
        serverRequest.end();
        const errorToDisplay = `${e} \\n "${e.code}"`;
        logger.error(errorToDisplay);
        // Sometimes error ECONNRESET from serverRequest happened after clientResponse (the proxy) was successfully sent
        // Happened on instagram.com
        if (!clientResponse.writableFinished) {
          clientResponse.writeHead(200, {
            'Content-Type': 'text/html',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Cross-Origin-Embedder-Policy': 'credentialless',
          });
          clientResponse.end(getProxyFailedPage(errorToDisplay));
        }
      });

      serverRequest.end();
    }
  });

  app.listen(PORT);
  logger.info(`Running on ${PATH}`);
};

export { createServer };