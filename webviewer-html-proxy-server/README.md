# Webviewer Html Proxy Server
This is a proxy server to use with [HTML sample by PDFTron](https://github.com/PDFTron/webviewer-html-annotate-proxy)

## Disclaimer

This project is experimental. A proxy server is used to serve webpage assets. This is done to get around various security issues, when loading a webpage in an iframe. This works for a good amount of pages but there are many exceptions. If you have a subset of web pages that you would like to support then we recommend forking [this repository](https://github.com/PDFTron/webviewer-html-proxy-server) and making the necessary fixes. We won't be making those changes because it would likely result in other pages failing.

## Install

```
npm install @pdftron/webviewer-html-proxy-server
```

## How to use

Call the `createServer` function in your server component and pass in an object that includes `SERVER_ROOT` and `PORT`. You can, optionally, pass in 
- `CORS_OPTIONS`: an object to configure CORS, see: https://expressjs.com/en/resources/middleware/cors.html
- `COOKIE_SETTING`: an object to configure COOKIE, see https://expressjs.com/en/api.html#res.cookie
- `ALLOW_POTENTIALLY_UNSAFE_URL`, a boolean value to disable URL validation. Setting this to true will override `ALLOW_HTTP_PROXY`
- `ALLOW_HTTP_PROXY`, a boolean value to allow loading localhost files and for unsecured HTTP websites to be proxied


## Example
```javascript
const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');
HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100
});
```

Setting `CORS_OPTIONS` example:

```javascript
HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100,
    CORS_OPTIONS: {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }
});
```

Setting `COOKIE_SETTING` example:

```javascript
HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100,
    COOKIE_SETTING: {
        sameSite: 'none',
        secure: true
    }
});
```

Setting `ALLOW_POTENTIALLY_UNSAFE_URL` example:

```javascript
HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100,
    ALLOW_POTENTIALLY_UNSAFE_URL: true
});
```

Setting `ALLOW_HTTP_PROXY` example:

```javascript
HTMLProxyServer.createServer({
    SERVER_ROOT: `http://localhost`,
    PORT: 3100,
    ALLOW_POTENTIALLY_UNSAFE_URL: false,
    ALLOW_HTTP_PROXY: true
});
```

## API Endpoints
### Proxy a URL

**URL** : `/pdftron-proxy?url=`

**Query Parameters** : `url=[string]` where `url` is a publicly accessible link.

**Method** : `GET`

#### Success Response

**Condition** : If the URL can be successfuly proxied

**Code** : `200 OK`

**Content example**

```json
{
    "validUrl": "https://www.pdftron.com/"
}
```

#### Error Responses

**Condition** : If URL can not be proxied.

**Code** : `400`

**Content** : `{ errorMessage: 'Please enter a valid URL and try again.' }`

### Download a PDF

**URL** : `/pdftron-download?url=`

**Query Parameters** : `url=[string]` where `url` is a publicly accessible link.

**Method** : `GET`

#### Success Response

**Condition** : If URL can be loaded in puppeteer.

**Code** : `200 OK`

**Content example**

```json
{
    "buffer": "<some image buffer>",
    "pageDimensions": { "width": 1440, "height": 770 }
}
```

#### Error Responses

**Condition** : If URL can not be loaded in puppeteer.

**Code** : `400`

**Content** : `{ errorMessage: 'Error taking screenshot from puppeteer' }`
