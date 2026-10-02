export type ViewerRoot = ShadowRoot | Document | HTMLElement;

export const getViewerRoot = (container: HTMLElement | null): ViewerRoot | null => {
  const viewerElement = container?.firstElementChild as HTMLElement | null;
  const iframe = container?.querySelector('iframe') as HTMLIFrameElement | null;
  return viewerElement?.shadowRoot || iframe?.contentDocument || viewerElement || null;
};

export const setActiveInstance = (instance: any) => {
  (window as any).instance = instance;
};

export const setLocalToolMode = (documentViewer: any, toolName: string) => {
  documentViewer.setToolMode(documentViewer.getTool(toolName));
};

export const waitForRender = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => resolve());
});
