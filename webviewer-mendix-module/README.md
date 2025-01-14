# WebViewer - Mendix Web Module

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [Apryse PDF SDK](https://www.apryse.com). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

This repo provides a backend module that facilitates server side operations that work with WebViewer.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

## Features

- Updating documents after annotating
- Exporting/importing XFDF
- Real-time collaboration

More to come!

## Installation

1. Download the module package from the marketplace or export the package manually (steps below).
2. Right click on your app package in Mendix Studio and import a module package.
3. Find the module package to import it.

## Initial setup

Before you begin, make sure you have installed [Mendix Studio Pro](https://docs.mendix.com/howto/general/install).

## Exporting a module

To export your module, right click on the `WebViewer` module and click `Export module package`. Follow the prompts and you should be able to deselect all the dependencies (unless you have made it a dependency). Finally, save the `mpk` file that will be imported as a module package.

## WebViewer APIs

See [API documentation](https://docs.apryse.com/api/web/WebViewerInstance.html).

## Support

https://apryse.com/form/trial-support

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
