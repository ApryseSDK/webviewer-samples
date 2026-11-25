// Mock the WebViewer constructor since the WebViewer library is loaded
// from wwwroot/lib in the browser and isn't available in the test environment.
const mockInstance = {};

beforeEach(() => {
  document.body.innerHTML = '<div id="viewer"></div>';
  window.WebViewer = jest.fn(() => Promise.resolve(mockInstance));
  jest.isolateModules(() => {
    require('../../wwwroot/js/webviewerScripts.js');
  });
});

afterEach(() => {
  delete window.WebViewer;
  delete window.webviewerFunctions;
});

describe('webviewerFunctions.initWebViewer', () => {
  it('is exposed on the window for Blazor JS interop', () => {
    expect(typeof window.webviewerFunctions.initWebViewer).toBe('function');
  });

  it('mounts WebViewer in the viewer element', () => {
    window.webviewerFunctions.initWebViewer('my-license-key');

    expect(window.WebViewer).toHaveBeenCalledTimes(1);
    const [options, element] = window.WebViewer.mock.calls[0];
    expect(element).toBe(document.getElementById('viewer'));
    expect(options.path).toBe('lib');
    expect(options.initialDoc).toMatch(/\.pdf$/);
  });

  it('passes the license key to WebViewer', () => {
    window.webviewerFunctions.initWebViewer('my-license-key');

    const [options] = window.WebViewer.mock.calls[0];
    expect(options.licenseKey).toBe('my-license-key');
  });

  it('falls back to an empty license key when none is provided', () => {
    window.webviewerFunctions.initWebViewer(null);

    const [options] = window.WebViewer.mock.calls[0];
    expect(options.licenseKey).toBe('');
  });
});
