# WebViewer - Mendix Web Widget

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in customizing and integrating WebViewer into Mendix low-code app.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure you have installed [Node.js](https://nodejs.org/en/) in your development environment.

## install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-mendix
npm install
```


## Create a new Mendix App or use an existing app

Open [Mendix Studio Pro](https://docs.mendix.com/howto/general/install) and create a new project by selecting `File > New Project` from the top menu bar, and choose the `Blank` app.

After creating a new app or inside of the existing app, navigate to the root directory and create a new folder called `CustomWidgets/WebViewer` and place the extracted contents from this sample inside.

By default, Mendix projects are stored in:
```
C:\Users\$your_username\Documents\Mendix\
```
In the terminal or command line, navigate to `CustomWidgets/WebViewer` and run:
```
npm install
```

After the command completes, run:
```
npm run dev
```
This will contiuously make a build of the Mendix Web Widget with WebViewer as the code changes and copy it into the app widget folder. It will be complete when you see something like this in your terminal:

```
bundles C:\Users\$your_username\Documents\Mendix\MyApp\CustomWidget\WebViewer\src\WebViewer.tsx → dist/tmp/widgets/pdftron/webviewer/WebViewer.js...
LiveReload enabled
created dist/tmp/widgets/pdftron/webviewer/WebViewer.js in 37.1s
bundles C:\Users\$your_username\Documents\Mendix\MyApp\CustomWidget\WebViewer\src\WebViewer.tsx → dist/tmp/widgets/pdftron/webviewer/WebViewer.mjs...
LiveReload enabled on port 35730
created dist/tmp/widgets/pdftron/webviewer/WebViewer.mjs in 2s
bundles C:\Users\$your_username\Documents\Mendix\MyApp\CustomWidget\WebViewer\src\WebViewer.editorPreview.tsx → dist/tmp/widgets/WebViewer.editorPreview.js...
created dist/tmp/widgets/WebViewer.editorPreview.js in 1.3s

[2022-07-05 13:23:22] waiting for changes...
```

Next, we must copy the static `lib` assets required for WebViewer to run. The files are located in `CustomWidgets/WebViewer/node_modules/@pdftron/webviewer/public` and must be moved into a location that will be served and publicly accessible.

## Prior to Mendix 9

We can place it into `theme/resources`. Create a new folder called `lib` and place the contents from `node_modules/@pdftron/webviewer/public` there.
`theme/resources` should have a directory structure like so:
```
/path/to/your/mendix/app/theme/resources
└───lib
    ├───core
    └───ui
```

## Mendix 9 or higher

Beginning with Mendix 9, the `theme/resources` path is no longer valid. As such, please move the resources to respective folders for `web` and `mobile`. For example, for `web` it will look like this:
```
/path/to/your/mendix/app/theme/web/resources
└───lib
    ├───core
    └───ui
```

## Place WebViewer into a Page

In your Mendix toolbox, you should see the `WebViewer` widget near the very bottom.

1. Click and drag the widget on to your page. You can bind to an entity if you wish. More details in the next section.

2. Run your Mendix app and you should see WebViewer loaded on the page that you added it on. By default, it will have loaded a default document.

3. Right click the widget and access the properties. You can change the loaded document using the URL property. This is useful for single document viewing purposes.

You can customize the widget by checking out other guides we have available. Perform your customizations inside of `src/components/PDFViewer.tsx`. Do not forget to run `npm run dev` within the Widget's console or terminal and update the files in your App by pressing F4, or from the top menu bar selecting `Project > Synchronize Project Directory`.

You can check out other guides like [how to open your own documents](https://docs.apryse.com/documentation/web/guides/basics/open/url/) or [how to disable certain features](https://docs.apryse.com/documentation/web/guides/hiding-elements/).
