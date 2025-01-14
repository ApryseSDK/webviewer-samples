/* eslint-disable-next-line no-undef */
WebViewer({
  path: 'lib', // path to the Apryse 'lib' folder on your server
  // licenseKey: 'Insert commercial license key here after purchase',
  initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
  // initialDoc: '/path/to/my/file.pdf',  // You can also use documents on your server
}, document.getElementById('viewer'))
  .then(function(instance) {
    const { documentViewer, annotationManager } = instance.Core;
    // call methods from instance, documentViewer and annotationManager as needed

    // you can also access major namespaces from the instance as follows:
    // const Tools = instance.Core.Tools;
    // const Annotations = instance.Core.Annotations;

    // change to dark theme
    const theme = instance.UI.Theme;
    instance.UI.setTheme(theme.DARK);

    documentViewer.addEventListener('documentLoaded', function() {
    // call methods relating to the loaded document
    });
  });
/*eslint no-unused-vars: "warn"*/