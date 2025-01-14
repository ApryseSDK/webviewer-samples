[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating PDFTron WebViewer into a Tomcat JSP web application.

## Initial Setup

Before you begin, make sure your development environment includes Java

Node and npm described below are just for convenient to downloading and installation of WebViewer.

### Install Java

Linux:

Install the JDK and JRE to recompile.

```
sudo apt-get install openjdk-8-jre
sudo apt-get install openjdk-8-jdk
```

Mac:

Install the JDK.

```
brew tap AdoptOpenJDK/openjdk
brew install --cask adoptopenjdk8
```

### Install Node.js

Linux: `sudo apt install nodejs`

Mac: `brew install node`

### Install WebViewer

```
npm install
```

## Start the app

```
npm start
```

Navigate to http://localhost:8080/webviewer.

## Stop the app

```
npm stop
```

## WebViewer APIs

See [API documentation](https://docs.apryse.com/api/web/WebViewerInstance.html).

## License

See [license](./LICENSE).