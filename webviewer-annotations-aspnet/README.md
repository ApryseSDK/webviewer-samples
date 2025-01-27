# WebViewer annotations sample - using files and ASP.NET backend

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This is a WebViewer sample to show how you can save and load annotations through files with an ASP.NET backend.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-annotations-aspnet
npm install
```

## Run

- Open the server/webviewer-annotations-asp-net-sample.sln file in Visual Studio.
- Build the project and then run with IIS Express.
- When WebViewer has loaded you can add some annotations and then press the "save annotations" button that was added to the top right corner.
- After refreshing the page the saved annotations should be loaded into the document.

