import WebViewer from '@pdftron/webviewer';

const element = document.getElementById('viewer');

const onLoad = async (instance) => {
  const { documentViewer, annotationManager, Annotations } = instance.Core;

  documentViewer.addEventListener('documentLoaded', () => {
    const rectangleAnnot = new Annotations.RectangleAnnotation({
      PageNumber: 1,
      // values are in page coordinates with (0, 0) in the top left
      X: 100,
      Y: 150,
      Width: 200,
      Height: 50,
      Author: annotationManager.getCurrentUser(),
    });

    annotationManager.addAnnotation(rectangleAnnot);
    // need to draw the annotation otherwise it won't show up until the page is refreshed
    annotationManager.redrawAnnotation(rectangleAnnot);
  });
};

WebViewer(
  {
    path: '/public/webviewer',
    initialDoc:
      'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
  },
  element
).then((instance) => {
  onLoad(instance);
});
