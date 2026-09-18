import {
  getViewerRoot,
  setActiveInstance,
} from './ui-utils.ts';

const blankPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MDAgMzAwXSAvUmVzb3VyY2VzIDw8ID4+IC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDAgPj4Kc3RyZWFtCgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDUgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjI2OAolJUVPRgo=';
const stylePanelWidth = 264;

type DesignerOptions = {
  WebViewerConstructor: any;
  portal: HTMLElement;
  viewer: HTMLElement;
  registerStamp: (buffer: ArrayBuffer, title: string) => Promise<void>;
  activateMainInstance: () => void;
  stampPanelDataElement: string;
  libPath?: string;
};

const decodeBase64 = (base64: string) => {
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0).buffer;
};

export const createDesigner = (options: DesignerOptions) => {
  const {
    WebViewerConstructor,
    portal,
    viewer,
    registerStamp,
    activateMainInstance,
    stampPanelDataElement,
    libPath = '/webviewer',
  } = options;

  let instancePromise: Promise<any> | null = null;
  let blankPdfUrl: string | null = null;
  let disposeViewer: (() => void) | null = null;

  const updateToolbarLayout = (width = portal.clientWidth) => {
    const minimumPortalWidth = Math.min(720, Math.max(0, window.innerWidth - 40));
    const isCompact = width <= minimumPortalWidth;
    portal.classList.toggle('compact', isCompact);
    portal.classList.toggle('condensed', !isCompact && width < 850);
  };

  const getBlankPdfUrl = () => {
    if (!blankPdfUrl) {
      blankPdfUrl = URL.createObjectURL(new Blob(
        [decodeBase64(blankPdfBase64)],
        { type: 'application/pdf' },
      ));
    }
    return blankPdfUrl;
  };

  const close = () => {
    portal.classList.remove('open');
    void instancePromise?.then(({ UI }) => UI.setToolMode('AnnotationEdit'));
    activateMainInstance();
  };

  const ensureStylePanel = (UI: any) => {
    if (!UI.getPanels?.().some((panel: any) => panel.dataElement === 'stylePanel')) {
      UI.addPanel({ dataElement: 'stylePanel', location: 'left', render: 'stylePanel' });
    }
  };

  const setupViewer = async (instance: any) => {
    const { UI, Core } = instance;
    const { documentViewer, annotationManager } = Core;

    UI.enableDesktopOnlyMode?.();
    UI.disableElements([
      'ribbons',
      'tools-header',
      'leftPanel',
      'leftPanelButton',
      'notesPanel',
      'searchPanel',
      'searchButton',
      'menuButton',
      'linkButton',
      'rubberStampPanel',
      stampPanelDataElement,
    ]);
    UI.enableElements(['stylePanel']);
    ensureStylePanel(UI);
    UI.setPanelWidth('stylePanel', stylePanelWidth);
    UI.openElements(['stylePanel']);

    let isDocumentLoaded = false;
    const updateViewport = () => {
      if (!isDocumentLoaded || documentViewer.getPageCount() === 0) {
        return;
      }
      documentViewer.updateView();
      UI.setFitMode(UI.FitMode.FitPage);
    };
    let resizeFrame: number | null = null;
    const viewerResizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        updateViewport();
      });
    });
    viewerResizeObserver.observe(viewer);
    disposeViewer = () => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }
      viewerResizeObserver.disconnect();
    };

    const stampTool = documentViewer.getTool('AnnotationCreateRubberStamp');
    stampTool?.registerPresetStamps?.([]);
    stampTool?.clearDocumentStamps?.();

    const drawingToolNames = [
      'AnnotationCreateRectangle',
      'AnnotationCreateEllipse',
      'AnnotationCreatePolygon',
      'AnnotationCreateFreeHand',
      'AnnotationCreateFreeText',
    ];
    drawingToolNames.forEach((toolName) => {
      const tool = documentViewer.getTool(toolName);
      const mouseMove = tool?.mouseMove?.bind(tool);
      if (!mouseMove) {
        return;
      }

      tool.mouseMove = (event: MouseEvent) => {
        mouseMove(event);
        const annotation = tool.annotation;
        const pageCoordinate = tool.pageCoordinates?.[1];
        if (!annotation || !pageCoordinate) {
          return;
        }

        const pageWidth = documentViewer.getPageWidth(pageCoordinate.pageNumber);
        const pageHeight = documentViewer.getPageHeight(pageCoordinate.pageNumber);
        const reachedPageEdge = pageCoordinate.x <= 0
          || pageCoordinate.y <= 0
          || pageCoordinate.x >= pageWidth
          || pageCoordinate.y >= pageHeight;
        if (!reachedPageEdge) {
          return;
        }

        if (toolName === 'AnnotationCreateFreeHand') {
          tool.complete(true);
          return;
        }

        annotation.finish?.();
        tool.finish?.();
      };
    });

    const createStamp = async () => {
      const annotations = annotationManager.getAnnotationsList();
      if (!annotations.length) {
        return;
      }

      const xfdfString = await annotationManager.exportAnnotations();
      const buffer = await documentViewer.getDocument().getFileData({ xfdfString, flatten: true, downloadType: 'pdf' });
      const title = `Designed Stamp ${new Date().toLocaleTimeString()}`;
      annotationManager.deleteAnnotations(annotations);
      close();
      await registerStamp(buffer, title);
    };
    const closeDesigner = () => {
      annotationManager.deleteAnnotations(annotationManager.getAnnotationsList());
      close();
    };
    const header = UI.getModularHeader('default-top-header');
    const actionsGroup = new UI.Components.GroupedItems({
      dataElement: 'stamp-designer-actions',
      gap: 4,
      position: 'end',
      alwaysVisible: true,
      items: [
        new UI.Components.CustomButton({
          dataElement: 'stamp-designer-create',
          label: 'Create stamp',
          title: 'Create stamp',
          img: 'icon-plus-sign',
          onClick: createStamp,
          className: 'stamp-designer-create-button',
        }),
        new UI.Components.CustomButton({
          dataElement: 'stamp-designer-close',
          label: 'Close',
          title: 'Close stamp designer',
          img: 'icon-close',
          onClick: closeDesigner,
        }),
      ],
    });
    const configureHeader = () => {
      const toolsHeader = UI.getModularHeader('tools-header');
      const defaultToolGroups = toolsHeader?.getItems?.() || [];
      header?.setItems([...defaultToolGroups, actionsGroup]);
      toolsHeader?.setStyle({ display: 'none' });
    };
    documentViewer.addEventListener('documentLoaded', () => {
      isDocumentLoaded = true;
      updateViewport();
      window.setTimeout(configureHeader, 0);
    });
    UI.setToolMode('AnnotationCreateRectangle');
  };

  const open = async () => {
    if (portal.classList.contains('open')) {
      return;
    }

    const portalWidth = Math.min(1000, Math.max(0, window.innerWidth - 40));
    const portalHeight = Math.min(520, Math.max(0, window.innerHeight - 80));
    portal.classList.add('drag-positioned');
    portal.style.left = `${Math.max(0, (window.innerWidth - portalWidth) / 2)}px`;
    portal.style.top = `${Math.max(0, (window.innerHeight - portalHeight) / 2)}px`;
    portal.style.removeProperty('right');
    portal.classList.add('open');
    updateToolbarLayout();

    instancePromise ??= WebViewerConstructor({
        initialDoc: getBlankPdfUrl(),
        path: libPath,
        enableFilePicker: false,
        fullAPI: true,
        extension: 'pdf',
        css: '/stamp-creation-viewer-styles.css',
      }, viewer).then(async (instance: any) => {
        (window as any).stampCreationDesignerInstance = instance;
        await setupViewer(instance);
        return instance;
      });

    const instance = await instancePromise;
    setActiveInstance(instance);
    instance.UI.setToolMode('AnnotationCreateRectangle');
    instance.UI.closeElements(['stylePanel']);
    instance.UI.openElements(['stylePanel']);
  };

  const setupDragging = () => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const keepPortalInViewport = () => {
      if (!portal.classList.contains('drag-positioned')) {
        return;
      }

      const rect = portal.getBoundingClientRect();
      const left = Math.min(Math.max(0, rect.left), Math.max(0, window.innerWidth - rect.width));
      const top = Math.min(Math.max(0, rect.top), Math.max(0, window.innerHeight - rect.height));
      portal.style.left = `${left}px`;
      portal.style.top = `${top}px`;
    };

    const onMouseDown = (event: MouseEvent) => {
      const eventPath = event.composedPath();
      const isHeader = eventPath.some((element) => element instanceof HTMLElement
        && element.getAttribute('aria-label') === 'Top Header');
      if (!isHeader || eventPath.some((element) => element instanceof HTMLButtonElement)) {
        return;
      }
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      const rect = portal.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      portal.classList.add('drag-positioned');
      portal.style.left = `${initialLeft}px`;
      portal.style.top = `${initialTop}px`;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) {
        return;
      }
      const maxLeft = Math.max(0, window.innerWidth - portal.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - portal.offsetHeight);
      const left = Math.min(Math.max(0, initialLeft + event.clientX - startX), maxLeft);
      const top = Math.min(Math.max(0, initialTop + event.clientY - startY), maxTop);
      portal.style.left = `${left}px`;
      portal.style.top = `${top}px`;
    };
    const onMouseUp = () => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      window.requestAnimationFrame(() => {
        instancePromise?.then(({ Core }) => {
          Core.documentViewer.updateView();
          const viewerRoot = getViewerRoot(viewer);
          const viewerWindow = viewerRoot instanceof Document
            ? viewerRoot.defaultView
            : viewerRoot?.ownerDocument.defaultView;
          viewerWindow?.dispatchEvent(new Event('resize'));
        });
      });
    };
    const onResize = () => {
      updateToolbarLayout();
      keepPortalInViewport();
    };
    const portalResizeObserver = new ResizeObserver(([entry]) => {
      updateToolbarLayout(entry.contentRect.width);
      keepPortalInViewport();
    });
    portalResizeObserver.observe(portal);

    portal.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onResize);

    return () => {
      portal.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      portalResizeObserver.disconnect();
    };
  };

  const disposeDragging = setupDragging();
  const dispose = () => {
    disposeDragging();
    disposeViewer?.();
    disposeViewer = null;
    instancePromise?.then(({ UI }) => UI.dispose?.());
    if (blankPdfUrl) {
      URL.revokeObjectURL(blankPdfUrl);
      blankPdfUrl = null;
    }
  };

  return { open, close, dispose };
};
