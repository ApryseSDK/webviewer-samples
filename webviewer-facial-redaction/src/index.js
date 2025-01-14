/**
 * Converts given Canvas to HTMLImageElement.
 *
 * @param {Canvas} canvas Canvas from which Image is created
 * @returns {Promise} Resolving to HTMLImageElement
 */
function convertCanvasToImage(canvas) {
  return new Promise(function(resolve) {
    const base64ImageDataURL = canvas.toDataURL('image/jpeg');
    const image = new Image()
    image.onload = () => {
      // resolve image once it is fully loaded
      resolve(image)
    }
    image.src = base64ImageDataURL;
  });
}

/**
 * Creates RedactionAnnotation and adds them to document.
 *
 * Note: This doesn't apply faceDetections, if you want to apply faceDetections
 * programmatically see AnnotationManager.applyRedaction()
 *
 * @param {WebViewerInstance} webViewerInstance current instance on WebViewer
 * @param {Number} pageNumber Page number of the document where detections were found
 * @param {FaceDetection[]} faceDetections Faces that were detected by face-api.js
 */
function createFaceRedactionAnnotation(webViewerInstance, pageNumber, faceDetections) {
  if (faceDetections && faceDetections.length > 0) {
    const { Annotations, annotationManager } = webViewerInstance.Core;
    // We create a quad per detected face to allow us use only one redaction annotation.
    // You could create new RedactionAnnotation for each detected face, but in case where document contains
    // tens or hundreds of face applying reduction comes slow.
    const quads = faceDetections.map((detection) => {
      const x = detection.box.x;
      const y = detection.box.y;
      const width = detection.box.width;
      const height = detection.box.height;

      const topLeft = [x, y];
      const topRight = [x + width, y];
      const bottomLeft = [x, y + height];
      const bottomRight = [x + width, y + height];
      // Quad is defined as points going from bottom left -> bottom right -> top right -> top left
      return new Annotations.Quad(...bottomLeft, ...bottomRight, ...topRight, ...topLeft);
    });
    const faceAnnotation = new Annotations.RedactionAnnotation({
      Quads: quads,
    });
    faceAnnotation.Author = annotationManager.getCurrentUser();
    faceAnnotation.PageNumber = pageNumber;
    faceAnnotation.StrokeColor = new Annotations.Color(255, 0, 0, 1);
    annotationManager.addAnnotation(faceAnnotation, false);
    // Annotation needs to be redrawn so that it becomes visible immediately rather than on next time page is refreshed
    annotationManager.redrawAnnotation(faceAnnotation);
  }
}

/**
 *
 * @param {WebViewerInstance} webViewerInstance current instance on WebViewer
 * @param {Number} pageNumber Page number of the document where detection is ran
 * @returns {Promise} Resolves after faces are detected and RedactionAnnotations are added to document
 */
function detectAndRedactFacesFromPage(webViewerInstance, pageNumber) {
  return new Promise(function(resolve, reject) {
    const doc = webViewerInstance.Core.documentViewer.getDocument();
    const pageInfo = doc.getPageInfo(pageNumber);
    const displaySize = { width: pageInfo.width, height: pageInfo.height }
    // face-api.js is detecting faces from images, so we need to convert current page to a canvas which then can
    // be converted to an image.
    doc.loadCanvas({
      pageNumber,
      zoom: 0.5, // Scale page size down to allow faster image processing
      drawComplete: function drawComplete(canvas) {
        convertCanvasToImage(canvas).then(async (image) => {
          const detections = await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.40,
            maxResults: 300
          }));
          // As we scaled our image, we need to resize faces back to the original page size
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          createFaceRedactionAnnotation(webViewerInstance, pageNumber, resizedDetections)
          resolve();
        });
      }
    });
  });
}

/**
 * onClick handler factory for redact faces button. Creates new onClick handler that encloses
 * webViewer instance inside closure.
 *
 * @param {WebViewerInstance} webViewerInstance current instance on WebViewer
 * @returns {function} returns async click handler for redact faces button
 */
function onRedactFacesButtonClickFactory(webViewerInstance) {
  return async function onRedactFacesButtonClick() {
    const doc = webViewerInstance.Core.documentViewer.getDocument();
    const numberOfPages = doc.getPageCount();
    const { sendPageProcessing, showProgress, hideProgress } = createProgress(numberOfPages)
    showProgress();
    for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
      sendPageProcessing();
      await detectAndRedactFacesFromPage(webViewerInstance, pageNumber);
    }
    hideProgress()
  }
}

/**
 * Add custom redact faces button to the top menu
 *
 * @param {WebViewerInstance} webViewerInstance current instance on WebViewer
 * @param {function} onRedactFacesButtonClick Click handler executed when custom redact faces button is clicked
 */
function addRedactFacesButtonToHeader(webViewerInstance, onRedactFacesButtonClick) {
  const image = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg>';

  /** Legacy UI: Uncomment this to add the button to the header */
  // webViewerInstance.UI.setHeaderItems(function setHeaderItemsCallback(header) {
  //   const items = header.getItems();
  //   const redactButton = {
  //     type: 'actionButton',
  //     img: image,
  //     title: 'Redact faces',
  //     onClick: onRedactFacesButtonClick,
  //   };
  //   items.splice(10, 0, redactButton);
  //   header.update(items);
  // });
  /** End of Legacy UI */


  /** Modular UI: Add the button to the header */
  // Comment this out on legacy UI
  const redactFacesButton = new webViewerInstance.UI.Components.CustomButton({
    dataElement: 'customButton',
    title: 'Redact faces',
    img: image,
    onClick: onRedactFacesButtonClick,
  });
  const defaultHeader = webViewerInstance.UI.getModularHeader('default-top-header');
  const groupedItems = defaultHeader.getItems('groupedItems')[0];
  groupedItems.setItems([...groupedItems.items, redactFacesButton]);
  /** End of Modular UI */
}

// Load face-api.js model
faceapi.nets.ssdMobilenetv1.loadFromUri('/models');

WebViewer(
  {
    licenseKey: 'Insert your license key here',
    path: '/lib',
    fullAPI: true,
    enableRedaction: true,
    enableFilePicker: true,
    // ui: 'legacy',
    initialDoc: '/pdftron-people.pdf'
  },
  document.getElementById('viewer')
).then(function(webViewerInstance) {
  const FitMode = webViewerInstance.UI.FitMode;
  webViewerInstance.UI.setFitMode(FitMode.FitWidth);
  const onRedactFacesButtonClick = onRedactFacesButtonClickFactory(webViewerInstance);
  addRedactFacesButtonToHeader(webViewerInstance, onRedactFacesButtonClick)
});
