import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';

// The sample reads WebViewer Core from a global script tag, so a mock Core is
// installed on globalThis since the real library needs a browser and static assets.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const createMockDocumentViewer = () => ({
  setScrollViewElement: jest.fn(),
  setViewerElement: jest.fn(),
  enableAnnotations: jest.fn(),
  loadDocument: jest.fn(),
  addEventListener: jest.fn(),
  getTool: jest.fn((name) => ({ name })),
  setToolMode: jest.fn(),
  getZoomLevel: jest.fn(() => 1),
  zoomTo: jest.fn(),
  getAnnotationManager: jest.fn(() => ({})),
});

const createMockCore = (documentViewer) => ({
  setWorkerPath: jest.fn(),
  enableFullPDF: jest.fn(),
  DocumentViewer: jest.fn(() => documentViewer),
  Tools: { ToolNames: { EDIT: 'EDIT', RECTANGLE: 'RECTANGLE', REDACTION: 'REDACTION' } },
  Search: { Mode: { CASE_SENSITIVE: 1, WHOLE_WORD: 2 } },
});

describe('WebViewer custom UI sample', () => {
  let container;
  let root;
  let documentViewer;

  beforeEach(() => {
    documentViewer = createMockDocumentViewer();
    globalThis.Core = createMockCore(documentViewer);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete globalThis.Core;
  });

  it('initializes the document viewer with the demo document', async () => {
    await act(async () => root.render(<App />));

    expect(globalThis.Core.setWorkerPath).toHaveBeenCalledWith('/webviewer');
    expect(globalThis.Core.enableFullPDF).toHaveBeenCalledTimes(1);
    expect(documentViewer.setScrollViewElement).toHaveBeenCalledWith(container.querySelector('#scroll-view'));
    expect(documentViewer.setViewerElement).toHaveBeenCalledWith(container.querySelector('#viewer'));
    expect(documentViewer.enableAnnotations).toHaveBeenCalledTimes(1);
    expect(documentViewer.loadDocument).toHaveBeenCalledWith('/files/demo.pdf');
  });

  it('zooms the document in and out from the toolbar', async () => {
    await act(async () => root.render(<App />));

    const [zoomOutButton, zoomInButton] = container.querySelectorAll('#tools button');
    act(() => zoomInButton.click());
    expect(documentViewer.zoomTo).toHaveBeenLastCalledWith(1.25);
    act(() => zoomOutButton.click());
    expect(documentViewer.zoomTo).toHaveBeenLastCalledWith(0.75);
  });

  it('switches tool modes and toggles the search panel', async () => {
    await act(async () => root.render(<App />));

    act(() => container.querySelector('button[title="Create Redaction"]').click());
    expect(documentViewer.setToolMode).toHaveBeenLastCalledWith({ name: 'REDACTION' });

    // The search button is the last button in the toolbar.
    const searchButton = container.querySelector('#tools button:last-child');
    expect(container.querySelector('#search-container')).toBeNull();
    act(() => searchButton.click());
    expect(container.querySelector('#search-container input[placeholder="Search"]')).not.toBeNull();
    act(() => searchButton.click());
    expect(container.querySelector('#search-container')).toBeNull();
  });
});
