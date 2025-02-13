# WebViewer TomCat Java Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating Apryse WebViewer into a Tomcat JSP web application.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-tomcat-java
npm install
```

## Initial Setup

Before you begin, make sure your development environment includes Java

Node and npm described below are just for convenient to downloading and installation of WebViewer.

## Install Java

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

## Install Node.js

Linux: `sudo apt install nodejs`

Mac: `brew install node`

## Install WebViewer

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