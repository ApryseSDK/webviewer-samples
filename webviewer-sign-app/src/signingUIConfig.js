export const signingUIConfig = {
  modularComponents: {
    fileNameDisplay: {
      type: 'customElement',
      render: 'renderFileName',
      title: 'Document name',
      style: { display: 'flex', alignItems: 'center' },
    },
    previousFieldButton: {
      type: 'customButton',
      img: 'icon-chevron-left',
      label: 'Previous field',
      title: 'Previous field',
      onClick: 'onPreviousField',
    },
    nextFieldButton: {
      type: 'customButton',
      img: 'icon-chevron-right',
      label: 'Next field',
      title: 'Next field',
      onClick: 'onNextField',
    },
    signFieldButton: {
      type: 'customButton',
      img: 'icon-tool-signature',
      label: 'Sign current field',
      title: 'Sign the current field',
      onClick: 'onSignCurrentField',
    },
    downloadButton: {
      type: 'customButton',
      img: 'icon-download',
      label: 'Download',
      title: 'Download flattened PDF',
      onClick: 'onDownloadFlattened',
    },
    centerToolbarItems: {
      type: 'groupedItems',
      items: ['previousFieldButton', 'nextFieldButton', 'signFieldButton'],
      alwaysVisible: true,
    },
    rightToolbarItems: {
      type: 'groupedItems',
      items: ['downloadButton'],
      alwaysVisible: true,
    },
  },
  modularHeaders: {
    signingHeader: {
      placement: 'top',
      items: ['fileNameDisplay', 'centerToolbarItems', 'rightToolbarItems'],
      justifyContent: 'space-between',
    },
  },
};

export function createSigningFunctionMap(instance) {
  const { Core } = instance;
  let currentFieldIndex = 0;
  let lastVisibleFieldKey = '';

  const CURRENT_FIELD_COLOR = new Core.Annotations.Color(29, 95, 209);
  const CURRENT_FIELD_THICKNESS = 2;
  let highlightedWidget = null;
  let originalWidgetStroke = null;

  const clearFieldHighlight = () => {
    if (!highlightedWidget) return;
    highlightedWidget.StrokeColor = originalWidgetStroke.color;
    highlightedWidget.StrokeThickness = originalWidgetStroke.thickness;
    highlightedWidget.refresh();
    highlightedWidget = null;
    originalWidgetStroke = null;
  };

  const highlightField = field => {
    clearFieldHighlight();

    const widget = field?.widgets?.[0];
    if (!widget) return;

    originalWidgetStroke = { color: widget.StrokeColor, thickness: widget.StrokeThickness };
    widget.StrokeColor = CURRENT_FIELD_COLOR;
    widget.StrokeThickness = CURRENT_FIELD_THICKNESS;
    widget.refresh();
    highlightedWidget = widget;
  };

  const getNavigableFields = () => {
    const fields = Core.annotationManager
      .getFieldManager()
      .getFields()
      .filter(field => field.widgets?.[0]?.isVisible())
      .sort((firstField, secondField) => {
        const firstWidget = firstField.widgets[0];
        const secondWidget = secondField.widgets[0];
        return firstWidget.PageNumber !== secondWidget.PageNumber
          ? firstWidget.PageNumber - secondWidget.PageNumber
          : firstWidget.getY() - secondWidget.getY();
      });

    // If the set of visible fields changed (e.g. a signer switch or field being
    // signed/unsigned), reset back to the first field instead of an index that may
    // no longer make sense.
    const visibleFieldKey = fields.map(field => field.widgets[0].Id).join('|');
    if (visibleFieldKey !== lastVisibleFieldKey) {
      lastVisibleFieldKey = visibleFieldKey;
      currentFieldIndex = 0;
      clearFieldHighlight();
    }

    return fields;
  };

  const jumpToFieldAtIndex = (index, { scroll = true } = {}) => {
    const fields = getNavigableFields();
    if (!fields.length) return;

    currentFieldIndex = ((index % fields.length) + fields.length) % fields.length;
    highlightField(fields[currentFieldIndex]);
    if (scroll) {
      Core.annotationManager
        .getFieldManager()
        .jumpToField(fields[currentFieldIndex], { isSmoothScroll: true });
    }
  };

  const refreshCurrentFieldHighlight = () => {
    // Let getNavigableFields() reset currentFieldIndex first if the visible field set
    // changed, then read the now-current value instead of a stale one captured before the reset.
    getNavigableFields();
    jumpToFieldAtIndex(currentFieldIndex, { scroll: false });
  };

  // Keep the highlight in sync without needing the caller to invoke anything:
  // re-picks/highlights the current field whenever fields load, or any annotation change
  // could have altered which widgets are visible (shown/hidden fields, signing, etc).
  const { annotationManager, documentViewer } = Core;
  documentViewer.addEventListener('annotationsLoaded', refreshCurrentFieldHighlight);
  annotationManager.addEventListener('updateAnnotationPermission', refreshCurrentFieldHighlight);
  annotationManager.addEventListener('annotationHidden', refreshCurrentFieldHighlight);
  annotationManager.addEventListener('annotationChanged', refreshCurrentFieldHighlight);

  return {
    onPreviousField: () => jumpToFieldAtIndex(currentFieldIndex - 1),
    onNextField: () => jumpToFieldAtIndex(currentFieldIndex + 1),
    onSignCurrentField: () => {
      const widget = getNavigableFields()[currentFieldIndex]?.widgets[0];
      if (widget instanceof Core.Annotations.SignatureWidgetAnnotation) {
        clearFieldHighlight();
        instance.UI.signSignatureWidget(widget);
      }
    },
    onDownloadFlattened: () =>
      instance.UI.downloadPdf({
        filename: 'completed-signing-sample.pdf',
        includeAnnotations: true,
        flatten: true,
      }),
    renderFileName: () => {
      const element = document.createElement('div');
      element.className = 'signing-config-file-name';
      const updateFileName = () => {
        element.textContent =
          Core.documentViewer.getDocument()?.getFilename() || 'Signing sample';
      };
      Core.documentViewer.addEventListener('documentLoaded', updateFileName);
      updateFileName();
      return element;
    },
  };
}