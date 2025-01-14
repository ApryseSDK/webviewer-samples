# WebViewer - Next.js 14 sample

[WebViewer](https://www.pdftron.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [PDFTron PDF SDK](https://www.pdftron.com). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into any web project.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into a Next.js 14 project. With the source code access, it gives developers full control to customize and style the UI, build custom controls and logic, integrate into workflows, or build a UI from scratch.

Due to SSR in Next.js, the module needs to be imported dynamically, to avoid a "window is not defined" error due to re-rendering.
Read more here: https://github.com/vercel/next.js/discussions/42319

## Demos

- [Customizable out-of-the-box UI](https://showcase.apryse.com/toolbar-customization)
- [PDF Viewer](https://showcase.apryse.com/)
- [DOCX Editor](https://showcase.apryse.com/office-editor)
- [Annotation & Markup](https://showcase.apryse.com/annotation-permissions)
- [Generate PDFs from DOCX template](https://showcase.apryse.com/office-template-fill)
- [Digital Signatures](https://showcase.apryse.com/digital-signatures)
- [PDF Text Editing](https://showcase.apryse.com/pdf-editing)
- [Page Manipulation](https://showcase.apryse.com/pdf-page-manipulation-api)
- [Redaction](https://showcase.apryse.com/redaction)
- [Form Building](https://showcase.apryse.com/pdf-form-build)
- [Annotate Videos](https://showcase.apryse.com/annotate-video-frames)
- [More](https://showcase.apryse.com/)

## Trial

WebViewer comes with a 7-day trial without any feature limitations or trial key needed. To extend the trial, you can obtain the trial key by [signing-up](https://dev.apryse.com/) on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Serves the minified build
```
npm start
```

### Lints and fixes files
```
npm run lint
```

## API documentation

* [@pdftron/webviewer API documentation](https://docs.apryse.com/api/web/global.html#WebViewer__anchor)

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-ui)