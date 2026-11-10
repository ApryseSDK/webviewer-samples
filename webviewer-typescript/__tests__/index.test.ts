import WebViewer from '@pdftron/webviewer';

// Mock WebViewer since it requires a real browser environment and static assets
// that aren't available in the test environment.
jest.mock('@pdftron/webviewer', () => jest.fn());

const mockedWebViewer = WebViewer as unknown as jest.Mock;

const createMockInstance = () => ({
  Core: {
    documentViewer: {},
    annotationManager: {},
    Tools: {},
    Annotations: {},
  },
});

const loadSample = async (instance: ReturnType<typeof createMockInstance>): Promise<void> => {
  mockedWebViewer.mockResolvedValue(instance);
  jest.isolateModules(() => {
    require('../src/index.ts');
  });
  // Let the WebViewer promise resolve and the .then callback run.
  await Promise.resolve();
  await Promise.resolve();
};

describe('WebViewer TypeScript sample', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="header">TypeScript Sample</div><div id="viewer"></div>';
    mockedWebViewer.mockReset();
  });

  it('initializes WebViewer in the viewer element', async () => {
    await loadSample(createMockInstance());

    expect(mockedWebViewer).toHaveBeenCalledTimes(1);
    expect(mockedWebViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/lib',
        initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
      }),
      document.getElementById('viewer'),
    );
  });

  it('passes a license key option', async () => {
    await loadSample(createMockInstance());

    const [options] = mockedWebViewer.mock.calls[0];
    expect(typeof options.licenseKey).toBe('string');
  });

  it('handles the resolved WebViewer instance without errors', async () => {
    const unhandledRejections: unknown[] = [];
    const onRejection = (reason: unknown) => unhandledRejections.push(reason);
    process.on('unhandledRejection', onRejection);

    try {
      await loadSample(createMockInstance());
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });
});
