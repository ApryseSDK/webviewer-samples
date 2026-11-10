import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import WebViewer from '@pdftron/webviewer';
import StampCreation from '../src/components/StampCreation';
import { initializeStampCreation } from '../src/components/StampCreation/bootstrap.ts';
import { createDesigner } from '../src/components/StampCreation/designer.ts';
import { createStampPanel } from '../src/components/StampCreation/native-stamp-panel.ts';

// Mock WebViewer and the stamp creation modules since they require a real browser
// environment and static assets that aren't available in the test environment.
jest.mock('@pdftron/webviewer', () => jest.fn());
jest.mock('../src/components/StampCreation/designer.ts', () => ({ createDesigner: jest.fn() }));
jest.mock('../src/components/StampCreation/native-stamp-panel.ts', () => ({ createStampPanel: jest.fn() }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const createMockInstance = () => ({
  UI: { dispose: jest.fn() },
  Core: { documentViewer: { addEventListener: jest.fn() } },
});

const createMockDesigner = () => ({ open: jest.fn(), close: jest.fn(), dispose: jest.fn() });

const createMockStampPanel = () => ({
  activate: jest.fn(),
  registerStamp: jest.fn(),
  setup: jest.fn(),
  show: jest.fn(),
});

describe('WebViewer stamp creation sample', () => {
  let container;
  let root;

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('initializes the main WebViewer with the demo document', async () => {
    const instance = createMockInstance();
    WebViewer.mockResolvedValue(instance);
    createStampPanel.mockReturnValue(createMockStampPanel());
    createDesigner.mockReturnValue(createMockDesigner());

    await act(async () => root.render(<StampCreation />));

    expect(WebViewer).toHaveBeenCalledTimes(1);
    expect(WebViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        initialDoc: '/files/demo.pdf',
        path: '/webviewer',
        fullAPI: true,
      }),
      container.querySelector('#viewer'),
    );
  });

  it('wires the stamp panel into a designer rendered in the portal', async () => {
    const instance = createMockInstance();
    const stampPanel = createMockStampPanel();
    const viewer = document.createElement('div');
    const portal = document.createElement('div');
    const designerViewer = document.createElement('div');
    WebViewer.mockResolvedValue(instance);
    createStampPanel.mockReturnValue(stampPanel);
    createDesigner.mockReturnValue(createMockDesigner());

    await initializeStampCreation({
      WebViewerConstructor: WebViewer,
      mainViewerElement: viewer,
      portalElement: portal,
      designerViewerElement: designerViewer,
    });

    expect(createStampPanel).toHaveBeenCalledWith(expect.objectContaining({ instance, viewer }));
    expect(stampPanel.setup).toHaveBeenCalledTimes(1);
    expect(createDesigner).toHaveBeenCalledWith(expect.objectContaining({
      WebViewerConstructor: WebViewer,
      portal,
      viewer: designerViewer,
      registerStamp: stampPanel.registerStamp,
      activateMainInstance: stampPanel.activate,
      libPath: '/webviewer',
    }));
  });

  it('disposes the designer and WebViewer UI when unmounted', async () => {
    const instance = createMockInstance();
    const designer = createMockDesigner();
    WebViewer.mockResolvedValue(instance);
    createStampPanel.mockReturnValue(createMockStampPanel());
    createDesigner.mockReturnValue(designer);

    await act(async () => root.render(<StampCreation />));
    act(() => root.unmount());

    expect(designer.dispose).toHaveBeenCalledTimes(1);
    expect(instance.UI.dispose).toHaveBeenCalledTimes(1);
  });
});
