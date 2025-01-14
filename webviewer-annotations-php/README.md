# WebViewer annotations sample - using files and PHP backend

[WebViewer](https://apryse.com/products/webviewer) is a powerful JavaScript-based PDF Library that's part of the [Apryse SDK](https://apryse.com/). It allows you to view and annotate PDF files on your web app with a fully customizable UI.

![WebViewer](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This is a WebViewer sample to show how you can save and load annotations through files with PHP backend.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/) and a PHP development environment such as [built-in CLI](http://php.net/manual/en/features.commandline.webserver.php), [XAMPP](https://www.apachefriends.org/index.html) or [AMPPS](https://www.ampps.com/).

## Install

```
git clone https://github.com/ApryseSDK/webviewer-annotations-php-sample.git
cd webviewer-annotations-php-sample
npm install
```

## Run

Serve the root directory of this project using the PHP development environment, and navigate to `/client/index.html`.

## How to use

- Create annotations with annotations tools in the header
- Save annotations with the save button in the header
- Load annotations by refreshing the app
- You can find annotation data saved into an XFDF file in server/xfdf folder

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-annotations-php-sample)
