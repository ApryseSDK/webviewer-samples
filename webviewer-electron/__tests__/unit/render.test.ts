import WebViewer from '@pdftron/webviewer';

// Mock WebViewer since it requires a real browser environment and static assets
// that aren't available in the test environment.
jest.mock('@pdftron/webviewer', () => jest.fn());

const mockedWebViewer = jest.mocked(WebViewer);

const createMockInstance = () => {
  const fileData = new ArrayBuffer(4);
  const doc = { getFileData: jest.fn(async () => fileData), getFilename: jest.fn(() => 'sample.pdf') };

  return {
    fileData,
    doc,
    UI: {
      setTheme: jest.fn(),
      disableElements: jest.fn(),
      loadDocument: jest.fn(async () => undefined),
    },
    Core: {
      documentViewer: { getDocument: jest.fn(() => doc) },
      annotationManager: { exportAnnotations: jest.fn(async () => '<xfdf />') },
    },
  };
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const requireRenderer = () => {
  jest.isolateModules(() => {
    require('../../src/render');
  });
};

const loadSample = async (instance: ReturnType<typeof createMockInstance>) => {
  mockedWebViewer.mockResolvedValue(instance as unknown as Awaited<ReturnType<typeof WebViewer>>);
  requireRenderer();
  // Let the WebViewer promise resolve and the `then` callback run.
  await flushPromises();
};

const click = async (id: string) => {
  (document.getElementById(id) as HTMLButtonElement).click();
  await flushPromises();
};

  it('applies the dark theme and disables the download button', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    expect(instance.UI.setTheme).toHaveBeenCalledWith('dark');
    expect(instance.UI.disableElements).toHaveBeenCalledWith(['downloadButton']);
  });

  it('loads the file returned by the open file dialog', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    const data = new Uint8Array([1, 2, 3]);
    jest.mocked(window.electronAPI.openFile).mockResolvedValue({ name: 'sample.docx', data });
    await click('open');

    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(instance.UI.loadDocument).toHaveBeenCalledWith(expect.any(Blob), { filename: 'sample.docx' });
  });

  it('does not load a document when the open file dialog is canceled', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    jest.mocked(window.electronAPI.openFile).mockResolvedValue(undefined);
    await click('open');

    expect(instance.UI.loadDocument).not.toHaveBeenCalled();
  });

  it('saves the document with its annotations', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    await click('save');

    expect(instance.Core.annotationManager.exportAnnotations).toHaveBeenCalledTimes(1);
    expect(instance.doc.getFileData).toHaveBeenCalledWith({ xfdfString: '<xfdf />' });
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(new Uint8Array(instance.fileData), 'sample.pdf');
  });

  it('throws when the viewer element is missing', () => {
    document.getElementById('viewer')?.remove();

    expect(requireRenderer).toThrow('Could not find element with id "viewer"');
    expect(mockedWebViewer).not.toHaveBeenCalled();
  });
});
