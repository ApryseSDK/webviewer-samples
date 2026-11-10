import WebViewer from '@pdftron/webviewer';

// Mock WebViewer since it requires a real browser environment and static assets
// that aren't available in the test environment.
jest.mock('@pdftron/webviewer', () => jest.fn());

const createMockInstance = () => {
  const listeners = {};
  const annotationManager = {
    getCurrentUser: jest.fn(() => 'Guest'),
    addAnnotation: jest.fn(),
    redrawAnnotation: jest.fn(),
  };

  return {
    listeners,
    Core: {
      documentViewer: {
        addEventListener: jest.fn((eventName, callback) => {
          listeners[eventName] = callback;
        }),
      },
      annotationManager,
      Annotations: {
        RectangleAnnotation: jest.fn(function RectangleAnnotation(options) {
          Object.assign(this, options);
        }),
      },
    },
  };
};

const loadSample = async (instance) => {
  WebViewer.mockResolvedValue(instance);
  jest.isolateModules(() => {
    require('../index.js');
  });
  // Let the WebViewer promise resolve and onLoad run.
  await Promise.resolve();
  await Promise.resolve();
};

describe('WebViewer JS sample', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="viewer"></div>';
    WebViewer.mockReset();
  });

  it('initializes WebViewer in the viewer element', async () => {
    await loadSample(createMockInstance());

    expect(WebViewer).toHaveBeenCalledTimes(1);
    expect(WebViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/public/webviewer',
        initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
      }),
      document.getElementById('viewer'),
    );
  });

  it('registers a documentLoaded listener', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    expect(instance.Core.documentViewer.addEventListener).toHaveBeenCalledWith('documentLoaded', expect.any(Function));
  });

  it('adds and redraws a rectangle annotation when the document loads', async () => {
    const instance = createMockInstance();
    await loadSample(instance);

    instance.listeners.documentLoaded();

    const { annotationManager, Annotations } = instance.Core;
    expect(Annotations.RectangleAnnotation).toHaveBeenCalledWith({
      PageNumber: 1,
      X: 100,
      Y: 150,
      Width: 200,
      Height: 50,
      Author: 'Guest',
    });

    const rectangleAnnot = Annotations.RectangleAnnotation.mock.instances[0];
    expect(annotationManager.addAnnotation).toHaveBeenCalledWith(rectangleAnnot);
    expect(annotationManager.redrawAnnotation).toHaveBeenCalledWith(rectangleAnnot);
  });
});
