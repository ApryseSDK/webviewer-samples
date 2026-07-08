import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import Barcode from '../Barcode';
import javascriptBarcodeReader from 'javascript-barcode-reader';
import jsQR from "jsqr";
import './webviewer.css';

const createSnipTool = ({ docViewer, Tools, Annotations }) => {
  class SnipTool extends Tools.RectangleCreateTool {
    constructor(viewer) {
      super(viewer, 'SnipTool');
      this.defaults.StrokeColor = new Annotations.Color('#ff0000');
      this.defaults.StrokeThickness = 2;
    }
  }

  return new SnipTool(docViewer);
};

const readBarcode = async (copyCanvas) => {
  try {
    const result = await javascriptBarcodeReader({
      image: copyCanvas,
      barcode: 'code-128',
    });
    alert(`Barcode: ${result}`);
  } catch (error) {
    console.log(error);
  }
};

const flattenAllAnnotations = async ({ annotationManager, PDFNet, documentViewer }) => {
  const annots = await annotationManager.exportAnnotations();
  const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(annots);
  const doc = await documentViewer.getDocument().getPDFDoc();
  await doc.fdfUpdate(fdf_doc);
  await doc.flattenAnnotations();
  annotationManager.deleteAnnotations(annotationManager.getAnnotationsList());
  documentViewer.refreshAll();
  documentViewer.updateView();
  documentViewer.getDocument().refreshTextData();
};

const handleSnipAnnotation = async ({ annotation, annotationManager, documentViewer, getCanvasMultiplier }) => {
  const pageIndex = annotation.PageNumber;
  const rootElement = document.getElementsByTagName('apryse-webviewer')[0].shadowRoot;
  const canvasMultiplier = getCanvasMultiplier();
  const pageContainer = rootElement.getElementById('pageContainer' + pageIndex);
  const pageCanvas = pageContainer.querySelector('.canvas' + pageIndex);
  const topOffset = Number.parseFloat(pageContainer.style.top) || 0;
  const leftOffset = Number.parseFloat(pageContainer.style.left) || 0;

  const zoom = documentViewer.getZoomLevel();
  const x = annotation.X * zoom - leftOffset;
  const y = annotation.Y * zoom - topOffset;
  const width = annotation.Width * zoom * canvasMultiplier;
  const height = annotation.Height * zoom * canvasMultiplier;

  const copyCanvas = document.createElement('canvas');
  copyCanvas.width = width;
  copyCanvas.height = height;
  const ctx = copyCanvas.getContext('2d');
  ctx.drawImage(pageCanvas, x, y, width, height, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    alert(`QR Code: ${code.data}`);
  } else {
    await readBarcode(copyCanvas);
  }

  annotationManager.deleteAnnotation(annotation);
};

const registerToolbar = ({ instance, customSnipTool, onFlatten }) => {
  instance.UI.setToolbarGroup('toolbarGroup-Edit');

  instance.UI.registerTool({
    toolName: 'SnipTool',
    toolObject: customSnipTool,
    buttonImage: '../../../price.svg',
    buttonName: 'snipToolButton',
    tooltip: 'Snipping Tool',
  });

  const editGroup = instance.UI.getGroupedItems('editGroupedItems');
  editGroup.setItems([
    {
      type: 'toolButton',
      toolName: 'SnipTool'
    },
    new instance.UI.Components.CustomButton({
      dataElement: 'customButton',
      className: 'custom-button-class',
      onClick: onFlatten,
      img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
      title: 'Flatten Annotations',
    })
  ]);
};

const WebViewerPDFTron = () => {
  const viewer = useRef(null);
  const [viewerInstance, setViewerInstance] = useState(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const initializeViewer = async () => {
      const instance = await WebViewer(
        {
          path: '/webviewer/lib',
          initialDoc:
            'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
          fullAPI: true,
          disabledElements: ['ribbons', 'cropToolButton', 'snippingToolButton']
        },
        viewer.current,
      );

      setViewerInstance(instance);
      const {
        documentViewer,
        annotationManager,
        Annotations,
        Tools,
        PDFNet,
        getCanvasMultiplier,
      } = instance.Core;
      await PDFNet.initialize();

      const customSnipTool = createSnipTool({
        docViewer: documentViewer,
        Tools,
        Annotations,
      });

      registerToolbar({
        instance,
        customSnipTool,
        onFlatten: () => flattenAllAnnotations({ annotationManager, PDFNet, documentViewer }),
      });

      customSnipTool.addEventListener('annotationAdded', (annotation) =>
        handleSnipAnnotation({ annotation, annotationManager, documentViewer, getCanvasMultiplier })
      );
    };

    initializeViewer();
  }, []);

  return (
    <div className="container">
      <div className="webviewer" ref={viewer}></div>
      <Barcode instance={viewerInstance} />
    </div>
  );
};

export default WebViewerPDFTron;
