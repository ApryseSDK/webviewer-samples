import {
  getViewerRoot,
  setActiveInstance,
} from './ui-utils.ts';
import { createDesigner } from './designer.ts';
import { createStampPanel } from './native-stamp-panel.ts';

type StampCreationElements = {
  mainViewerElement: HTMLElement;
  portalElement: HTMLElement;
  designerViewerElement: HTMLElement;
};

export const initializeStampCreation = ({
  WebViewerConstructor,
  mainViewerElement,
  portalElement,
  designerViewerElement,
}: StampCreationElements & { WebViewerConstructor: any }) => {
const hashFile = '/' + (window.location.hash || 'files/demo.pdf').replace('#', '');

window.localStorage.removeItem('init_timestamp');

const stampPanelDataElement = 'stamp-creation-rubber-stamp-panel';
const viewerStylesheetId = 'stamp-creation-viewer-styles';

const hideViewerHeaders = (container: HTMLElement | null) => {
  const root = getViewerRoot(container);
  if (!root) {
    return;
  }

  if (!root.querySelector(`#${viewerStylesheetId}`)) {
    const stylesheet = document.createElement('link');
    stylesheet.id = viewerStylesheetId;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/stamp-creation-viewer-styles.css';
    const stylesheetHost = root instanceof Document ? root.head : root;
    stylesheetHost.appendChild(stylesheet);
  }
};

const keepViewerHeadersHidden = (container: HTMLElement | null, onMutation?: () => void) => {
  let observedRoot: ShadowRoot | Document | HTMLElement | null = null;
  let observer: MutationObserver | null = null;
  let attempts = 0;

  const attach = () => {
    hideViewerHeaders(container);
    const root = getViewerRoot(container);
    if (root && root !== observedRoot) {
      observer?.disconnect();
      observedRoot = root;
      observer = new MutationObserver(() => {
        hideViewerHeaders(container);
        onMutation?.();
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    attempts++;
    if (attempts < 40) {
      window.setTimeout(attach, 250);
    }
  };

  attach();
};

const setupMainViewer = (instance: any) => {
  setActiveInstance(instance);
  const stampPanel = createStampPanel({
    instance,
    viewer: mainViewerElement,
    configureViewerRoot: keepViewerHeadersHidden,
  });
  stampPanel.setup();

  if (!portalElement || !designerViewerElement) {
    throw new Error('Stamp designer elements are missing.');
  }

  const libPath = '/webviewer';

  const designer = createDesigner({
    WebViewerConstructor,
    portal: portalElement,
    viewer: designerViewerElement,
    registerStamp: stampPanel.registerStamp,
    activateMainInstance: stampPanel.activate,
    stampPanelDataElement,
    libPath,
  });

  const { UI, Core } = instance;
  let headerConfigured = false;
  const configureHeader = () => {
    if (headerConfigured) {
      return;
    }

    const header = UI.getModularHeader('default-top-header');
    const toolsHeader = UI.getModularHeader('tools-header');
    if (!header || !toolsHeader) {
      return;
    }

    UI.enableElements(['header', 'default-top-header']);
    const zoom = new UI.Components.Zoom({
      dataElement: 'stamp-creation-zoom',
    });
    const actionsGroup = new UI.Components.GroupedItems({
      dataElement: 'stamp-creation-actions',
      gap: 4,
      position: 'end',
      alwaysVisible: true,
      items: [
        new UI.Components.CustomButton({
          dataElement: 'stamp-creation-open-designer',
          label: 'Open stamp designer',
          title: 'Open stamp designer',
          img: '/assets/stamp-designer.svg',
          onClick: designer.open,
          className: 'stamp-creation-open-designer-button',
          style: {
            border: '1px solid var(--primary-button)',
            borderRadius: '4px',
            background: 'var(--primary-button)',
            color: 'var(--primary-button-text)',
          },
        }),
        new UI.Components.CustomButton({
          dataElement: 'stamp-creation-show-stamps',
          label: 'Show stamps panel',
          title: 'Show stamps panel',
          img: '/assets/stamps-panel.svg',
          onClick: stampPanel.show,
          className: 'stamp-creation-show-stamps-button',
        }),
      ],
    });
    header.setItems([zoom, actionsGroup]);
    toolsHeader.setStyle({ display: 'none' });
    headerConfigured = true;
  };
  const scheduleHeaderConfiguration = () => window.setTimeout(configureHeader, 0);
  Core.documentViewer.addEventListener('documentLoaded', scheduleHeaderConfiguration);
  window.setTimeout(configureHeader, 1000);

  return designer;
};

const libPath = '/webviewer';

return WebViewerConstructor({
  initialDoc: hashFile,
  path: libPath,
  enableFilePicker: true,
  fullAPI: true,
  css: '/stamp-creation-viewer-styles.css',
}, mainViewerElement).then((instance: any) => ({
  instance,
  designer: setupMainViewer(instance),
}));
};
