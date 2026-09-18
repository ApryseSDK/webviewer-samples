import { getViewerRoot, setActiveInstance, setLocalToolMode, waitForRender } from './ui-utils.ts';

type StampPanelOptions = {
  instance: any;
  viewer: HTMLElement | null;
  configureViewerRoot: (container: HTMLElement | null, onMutation?: () => void) => void;
};

type RegisteredStampSource = {
  bytes: Uint8Array;
  title: string;
  filename: string;
  extension: 'pdf';
  pages: number[];
  cropVisibleContent: boolean;
  category: string;
};

const panelDataElement = 'stamp-creation-rubber-stamp-panel';
const category = 'My Stamps';
const closeButtonId = 'stamp-creation-panel-close';
const filterOptionId = 'stamp-creation-my-stamps-filter';
const previewContainerId = 'stamp-creation-document-stamp-previews';
const previewListId = 'stamp-creation-document-stamp-preview-list';
const templateIdKey = 'trn-pdf-stamp-template-id';
const resizeBarDataElement = 'stamp-creation-rubber-stamp-panel-resize-bar';

export const createStampPanel = ({ instance, viewer, configureViewerRoot }: StampPanelOptions) => {
  const { UI, Core } = instance;
  const { documentViewer } = Core;
  const stampTool = documentViewer.getTool('AnnotationCreateRubberStamp');
  let sources: RegisteredStampSource[] = [];
  let latestAnnotation: any = null;
  let isCategoryVisible = true;

  const activate = () => {
    setActiveInstance(instance);
    (window as any).stampCreationMainInstance = instance;
  };

  const getPanel = () => getViewerRoot(viewer)
    ?.querySelector<HTMLElement>(`[data-element="${panelDataElement}"].Panel`) || null;

  const ensurePanel = () => {
    if (!UI.getPanels?.().some((panel: any) => panel.dataElement === panelDataElement)) {
      UI.addPanel({ dataElement: panelDataElement, location: 'left', render: 'rubberStampPanel' });
    }
  };

  const enablePanelResizing = () => {
    const panel = getPanel()?.closest<HTMLElement>('.ModularPanel');
    if (!panel || panel.querySelector(`[data-element="${resizeBarDataElement}"]`)) {
      return;
    }

    const resizeBar = document.createElement('div');
    resizeBar.className = 'resize-bar stamp-creation-panel-resize-bar';
    resizeBar.dataset.element = resizeBarDataElement;
    resizeBar.setAttribute('role', 'separator');
    resizeBar.setAttribute('aria-orientation', 'vertical');
    resizeBar.setAttribute('aria-label', 'Resize stamps panel');
    resizeBar.addEventListener('mousedown', (event) => {
      event.preventDefault();
      const initialWidth = panel.getBoundingClientRect().width;
      const startX = event.clientX;
      const onMouseMove = (moveEvent: MouseEvent) => {
        const maxWidth = Math.min(480, window.innerWidth - 40);
        const width = Math.min(maxWidth, Math.max(250, initialWidth + moveEvent.clientX - startX));
        UI.setPanelWidth(panelDataElement, width);
      };
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
    panel.appendChild(resizeBar);
  };

  const applySearch = () => {
    const panel = getPanel();
    const searchText = panel?.querySelector<HTMLInputElement>('.StampSearchOverlay .search-panel-input')
      ?.value.trim().toLocaleLowerCase() || '';
    let hasVisibleStamp = false;
    panel?.querySelectorAll<HTMLButtonElement>(`#${previewContainerId} .rubber-stamp`).forEach((button) => {
      button.hidden = !(button.dataset.searchText?.includes(searchText) ?? false);
      hasVisibleStamp ||= !button.hidden;
    });
    const previewContainer = panel?.querySelector<HTMLElement>(`#${previewContainerId}`);
    if (previewContainer) {
      previewContainer.hidden = !isCategoryVisible || !hasVisibleStamp;
    }
  };

  const bindSearch = () => {
    const input = getPanel()?.querySelector<HTMLInputElement>('.StampSearchOverlay .search-panel-input');
    if (!input || input.dataset.stampCreationBound) {
      return;
    }
    input.dataset.stampCreationBound = 'true';
    input.addEventListener('input', applySearch);
  };

  const hideNativeCategories = () => {
    const stampsContainer = getPanel()?.querySelector<HTMLElement>('.rubber-stamps-container');
    Array.from(stampsContainer?.children || []).forEach((section) => {
      const isGeneratedStamps = section.id === previewContainerId
        || Boolean(section.querySelector(`#${previewContainerId}`));
      (section as HTMLElement).hidden = !isGeneratedStamps;
    });
  };

  const ensureCloseButton = () => {
    const header = getPanel()?.querySelector<HTMLElement>('.rubber-stamp-panel-header');
    if (!header || header.querySelector(`#${closeButtonId}`)) {
      return;
    }

    header.classList.add('stamp-creation-panel-header');
    const button = document.createElement('button');
    button.id = closeButtonId;
    button.className = 'stamp-creation-panel-close';
    button.type = 'button';
    button.title = 'Close';
    button.setAttribute('aria-label', 'Close stamps panel');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.3 7.7 4.3 4.3-4.3 4.3 1.4 1.4 4.3-4.3 4.3 4.3 1.4-1.4-4.3-4.3 4.3-4.3-1.4-1.4-4.3 4.3-4.3-4.3z" fill="currentColor"/></svg>';
    button.addEventListener('click', () => UI.closeElements([panelDataElement]));
    header.appendChild(button);
  };

  const ensureFilter = () => {
    const root = getViewerRoot(viewer);
    const searchOverlay = getPanel()?.querySelector<HTMLElement>('.StampSearchOverlay');
    const filterButton = searchOverlay?.querySelector<HTMLButtonElement>('[data-element="stampSearchOptionsButton"]');
    if (!root || !searchOverlay || !filterButton || searchOverlay.querySelector(`#${filterOptionId}`)) {
      return;
    }

    searchOverlay.classList.add('stamp-creation-search-overlay');
    const popover = document.createElement('div');
    popover.id = filterOptionId;
    popover.className = 'StampSearchOptionsFlyout stamp-creation-filter-popover';
    popover.hidden = true;
    const label = document.createElement('label');
    label.className = 'stamp-creation-filter-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCategoryVisible;
    checkbox.addEventListener('change', () => {
      isCategoryVisible = checkbox.checked;
      applySearch();
    });
    label.append(checkbox, document.createTextNode(category));
    popover.appendChild(label);
    searchOverlay.appendChild(popover);

    filterButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      UI.closeElements?.(['stampSearchOptionsFlyout']);
      popover.hidden = !popover.hidden;
      filterButton.setAttribute('aria-expanded', String(!popover.hidden));
    }, { capture: true });
    root.addEventListener('click', (event) => {
      const target = event.target as Node;
      if (!popover.hidden && !popover.contains(target) && !filterButton.contains(target)) {
        popover.hidden = true;
        filterButton.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const enhancePanel = () => {
    enablePanelResizing();
    ensureCloseButton();
    bindSearch();
    ensureFilter();
    hideNativeCategories();
    if (sources.length && !getPanel()?.querySelector(`#${previewContainerId}`)) {
      void renderGeneratedStamps().then(() => {
        if (latestAnnotation) {
          return select(latestAnnotation);
        }
      });
    }
  };

  const clear = () => {
    sources = [];
    stampTool.clearDocumentStamps?.();
    stampTool.registerPresetStamps?.([]);
  };

  const show = () => {
    activate();
    ensurePanel();
    UI.openElements([panelDataElement]);
  };

  const select = async (annotation: any) => {
    activate();
    await stampTool.setRubberStamp(annotation, annotation.Icon);
    setLocalToolMode(documentViewer, 'AnnotationCreateRubberStamp');
    await stampTool.showPreview();
  };

  const waitForPanelToolReset = () => new Promise<void>((resolve) => {
    let fallbackTimer = 0;
    const finish = () => {
      documentViewer.removeEventListener('toolModeUpdated', handleToolModeUpdated);
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const handleToolModeUpdated = (tool: any) => {
      if (tool?.name === 'AnnotationEdit') {
        finish();
      }
    };
    documentViewer.addEventListener('toolModeUpdated', handleToolModeUpdated);
    fallbackTimer = window.setTimeout(finish, 250);
  });

  const renderGeneratedStamps = async () => {
    const stampsContainer = getPanel()?.querySelector<HTMLElement>('.rubber-stamps-container');
    if (!stampsContainer) {
      return;
    }

    const annotations = (await stampTool.getStandardStampAnnotations()).filter((annotation: any) => {
      return annotation.getCustomData(templateIdKey);
    });
    let container = stampsContainer.querySelector<HTMLElement>(`#${previewContainerId}`);
    if (!container) {
      container = document.createElement('div');
      container.id = previewContainerId;
      container.className = 'CollapsibleSection';

      const heading = document.createElement('h2');
      heading.className = 'collapsible-page-group-header';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-controls', previewListId);
      toggle.textContent = category;
      heading.appendChild(toggle);

      const content = document.createElement('div');
      content.className = 'collapsible-content';
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        content.hidden = isExpanded;
      });
      container.append(heading, content);
      stampsContainer.appendChild(container);
    }

    let list = container.querySelector<HTMLElement>(`#${previewListId}`);
    if (!list) {
      list = document.createElement('div');
      list.id = previewListId;
      list.className = 'rubber-stamps-list';
      container.querySelector('.collapsible-content')?.appendChild(list);
    }
    const row = document.createElement('div');
    row.className = 'rubber-stamp-virtual-row standard-rubber-stamps-list';
    list.replaceChildren(row);

    await Promise.all(annotations.map(async (annotation: any) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rubber-stamp';
      button.setAttribute('aria-label', annotation.Icon);
      button.dataset.searchText = `${annotation.Icon} ${category}`.toLocaleLowerCase();
      const image = document.createElement('img');
      image.src = await stampTool.getPreview(annotation, { canvasWidth: 160, canvasHeight: 58 });
      image.alt = '';
      button.appendChild(image);
      button.addEventListener('click', () => select(annotation));
      row.appendChild(button);
    }));
    enhancePanel();
    applySearch();
  };

  const registerStamp = async (buffer: ArrayBuffer, title: string) => {
    activate();
    const expectedLabel = `${title} 1`;
    sources.push({
      bytes: new Uint8Array(buffer),
      title,
      filename: `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      extension: 'pdf',
      pages: [1],
      cropVisibleContent: false,
      category,
    });

    const result = await stampTool.setDocumentStamps(sources.map((source) => ({
      source: source.bytes.slice().buffer,
      title: source.title,
      filename: source.filename,
      extension: source.extension,
      pages: source.pages,
      cropVisibleContent: source.cropVisibleContent,
      category: source.category,
    })), { cropVisibleContent: false });
    if (result.failures?.length || result.pageFailures?.length || result.registeredCount === 0) {
      throw new Error('The stamp PDF was created, but WebViewer could not register it as a document stamp.');
    }

    const annotations = await stampTool.getStandardStampAnnotations();
    const annotation = annotations.find((item: any) => item.Icon === expectedLabel);
    if (!annotation) {
      throw new Error(`The stamp PDF was created, but "${expectedLabel}" could not be loaded for placement.`);
    }
    latestAnnotation = annotation;

    const panelToolReset = waitForPanelToolReset();
    show();
    await panelToolReset;
    await waitForRender();
    await waitForRender();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    await waitForRender();
    await renderGeneratedStamps();
    await waitForRender();
    await waitForRender();
    await select(annotation);
  };

  const setup = () => {
    UI.enableAllElements();
    UI.enableDesktopOnlyMode?.();
    UI.enableFeatureFlag(UI.FeatureFlags.NEW_STAMP_PANEL);
    UI.disableElements([
      'header',
      'default-top-header',
      'tools-header',
      'ribbons',
      'default-ribbon-group',
      'annotationPopup',
      'rubberStampPanel',
      'rubberStampPanelCustomTab',
      'rubberStampPanelCustom',
    ]);
    ensurePanel();
    clear();
    documentViewer.addEventListener('documentLoaded', clear);
    configureViewerRoot(viewer, enhancePanel);
  };

  return { activate, registerStamp, setup, show };
};
