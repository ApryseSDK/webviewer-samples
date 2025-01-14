WebViewer({
    path: 'lib',
    initialDoc: 'files/webviewer-demo-annotated.pdf'
  }, document.getElementById('viewer'))
  .then(function(instance) {

    // you can access documentViewer object for low-level APIs
    const { documentViewer } = instance.Core;

    // now you can access APIs through this.webviewer.getInstance()
    instance.UI.openElements(['notesPanel']);
    // see https://www.pdftron.com/documentation/web/guides/ui/apis for the full list of APIs
    
    // or listen to events from the viewer element
    document.getElementById('viewer').addEventListener('pageChanged', (e) => {
      const [ pageNumber ] = e.detail;
      console.log(`Current page is ${pageNumber}`);
    });

    // or from the documentViewer instance
    documentViewer.addEventListener('annotationsLoaded', () => {
      console.log('annotations loaded');
    });

    documentViewer.addEventListener('documentLoaded', function() {
      // and access classes defined in the WebViewer iframe
      const { Annotations, annotationManager } = instance.Core;
      const rectangle = new Annotations.RectangleAnnotation();
      rectangle.PageNumber = 1;
      rectangle.X = 100;
      rectangle.Y = 100;
      rectangle.Width = 250;
      rectangle.Height = 250;
      rectangle.StrokeThickness = 5;
      rectangle.Author = annotationManager.getCurrentUser();
      annotationManager.addAnnotation(rectangle);
      annotationManager.drawAnnotations(rectangle.PageNumber);
      // see https://www.pdftron.com/api/web/WebViewer.html for the full list of low-level APIs
    });

  });
