# WebViewer - Mendix Web Widget

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [Apryse PDF SDK](https://www.apryse.com). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in customizing and integrating WebViewer into Mendix low-code app. You can watch [a video here](https://youtu.be/a9HNVzbmDLM) to help you get started.

## Initial setup

Before you begin, make sure you have installed [Node.js](https://nodejs.org/en/) in your development environment.

## Create a new Mendix App or use an existing app

Open [Mendix Studio Pro](https://docs.mendix.com/howto/general/install) and create a new project by selecting `File > New Project` from the top menu bar, and choose the `Blank` app.

After creating a new app or inside of the existing app, navigate to the root directory and create a new folder called `CustomWidgets/WebViewer` and place the extracted contents from [this sample](https://github.com/PDFTron/webviewer-mendix-sample) inside.

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

### Prior to Mendix 9

We can place it into `theme/resources`. Create a new folder called `lib` and place the contents from `node_modules/@pdftron/webviewer/public` there.
`theme/resources` should have a directory structure like so:
```
/path/to/your/mendix/app/theme/resources
└───lib
    ├───core
    └───ui
```

### Mendix 9 or higher

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

## Connect Attribute to WebViewer

We can bind WebViewer to an attribute to dynamically change documents. In the following example, we will add widgets to allow users to provide a document URL which make WebViewer load the new document.

1. Access the `Domain Model` of the module where the viewer will be integrated, and create a new `Entity`. This entity will contain the file URL that we will load from. You can name it whatever you want.

2. Right-click the newly created `Entity`, click `Add > Attribute`. You can name it whatever you want but ensure its `Type` is set to `String`.

3. Next, open the page inside of your module.

4. Add a `Data View` widget to the page by dragging it from the Toolbox.

5. Double-click the widget, and give it a data source microflow by selecting `Data source > Type > Microflow`. This will create the entity when we change the URL.

6. In the microflow field, click the `Select` button and press `New` to create a new microflow. You can name it whatever you want.

7. Open the created microflow and drag `Create object` from the toolbox onto the microflow flow line. If there is a parameter object (the object that has `U` and `(Not set)` underneath), delete it.

8. Open `Create object` by double-clicking on it and select the entity we created earlier.

9. Right-click the `Create Entity` activity, then click `Set $NewEntity as Return Value`.

10. Go back to the page where you placed the `Data View`, and drag a `Text box` into `Data View` for the user to enter a URL.

11. Open the textbox's properties and find the `Data Source` panel.

12. Change the `Attribute` to the string attribute you created in Steps 1 and 2. This will set the attribute when it is changed in the text box.

13. Press F4 or from the top menu bar select `Project > Synchronize Project Directory` to synchronize with the local file changes.

14. Return to the page you placed the `Data View`. In the Toolbox, under `Add-ons`, you should now see `WebViewer`.

15. Drag the `WebViewer` widget into the `Data View`.

16. Right-click on the `WebViewer` widget and set the `Attribute` property to the attribute created on your entity.

17. You can now run the app by clicking `Run Locally` at the top.

WebViewer can now load the URL that is passed through the text box! When the URL and Attribute are used, **Attribute** takes priority. How does it work on the WebViewer side?

1. Navigate to the WebViewer location inside of `App/CustomWidgets/webViewer` and open it in your favourite code editor.

2. Open WebViewer component available in `src/components/PDFViewer.tsx`. Inside of it, you can see WebViewer constructor where you can pass various customization options and call APIs on the instance object. The Attribute that you have created in previous steps is passed in `props.file`:

```javascript
useEffect(() => {
    if (instance && props.value !== "") {
        instance.loadDocument(props.value);
    }
}, [props.value]);
```

In the code snippet, we are listening for any of the changes in `props` and then calling `loadDocument` API to load a new document. You can connect it with your existing flows or pass URLs from your file storage. Make sure you have the [CORS configured](https://docs.apryse.com/documentation/web/faq/cors-support/) in case you run into any errors.

You can now customize the widget by checking out other guides we have available. Perform your customizations inside of `src/components/PDFViewer.tsx`. Do not forget to run `npm run dev` within the Widget's console or terminal and update the files in your App by pressing F4, or from the top menu bar selecting `Project > Synchronize Project Directory`.

You can now checkout other guides like [how to open your own documents](https://docs.apryse.com/documentation/web/guides/basics/open/url/) or [how to disable certain features](https://docs.apryse.com/documentation/web/guides/hiding-elements/).

## WebViewer APIs

See [API documentation](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Support

https://apryse.com/form/trial-support

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-react-sample)
