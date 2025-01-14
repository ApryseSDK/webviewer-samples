# WebViewer annotations sample - using SQLite3 and Node.js backend

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into web projects.

![WebViewer](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This is a WebViewer sample to show how you can save and load annotations through an SQLite3 database with Node.js backend.

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/). This sample requires version 13 of Node.js.

## Install

```
git clone https://github.com/ApryseSDK/webviewer-annotations-sqlite3-sample.git
cd webviewer-annotations-sqlite3-sample
npm install
```

## Run

```
npm start
```

## How to use

- Create annotations with annotations tools in the header
- Annotations will be automatically saved to database as you create and modify annotations
- Load annotations by refreshing the app
- You can find annotation data saved into an XFDF database in server folder

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-annotations-sqlite3-sample)
