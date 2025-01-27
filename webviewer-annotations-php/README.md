# WebViewer annotations sample - using files and PHP backend

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates how to save and load annotations using XFDF files and a PHP backend.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/) and a PHP development environment such as [built-in CLI](http://php.net/manual/en/features.commandline.webserver.php), [XAMPP](https://www.apachefriends.org/index.html) or [AMPPS](https://www.ampps.com/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-annotations-php
npm install
```

## Run

Serve the root directory of this project using the PHP development environment, and navigate to `/client/index.html`.

## How to use

- Create annotations with annotations tools in the header
- Save annotations with the save button in the header
- Load annotations by refreshing the app
- You can find annotation data saved into an XFDF file in server/xfdf folder

