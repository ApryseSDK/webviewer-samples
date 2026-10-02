import { describe, expect, it, vi } from 'vitest';
import { createSigningFunctionMap } from '../src/signingUIConfig';

class SignatureWidgetAnnotation {
  constructor(id, pageNumber, y, visible = true) {
    this.Id = id;
    this.PageNumber = pageNumber;
    this.y = y;
    this.visible = visible;
    this.StrokeColor = 'original';
    this.StrokeThickness = 1;
    this.refresh = vi.fn();
  }

  getY() {
    return this.y;
  }

  isVisible() {
    return this.visible;
  }
}

const createInstance = fields => {
  const jumpToField = vi.fn();
  const annotationManager = {
    addEventListener: vi.fn(),
    getFieldManager: () => ({ getFields: () => fields, jumpToField }),
  };
  const instance = {
    Core: {
      Annotations: {
        Color: class Color {
          constructor(red, green, blue) {
            Object.assign(this, { red, green, blue });
          }
        },
        SignatureWidgetAnnotation,
      },
      annotationManager,
      documentViewer: { addEventListener: vi.fn() },
    },
    UI: { signSignatureWidget: vi.fn() },
  };

  return { instance, jumpToField };
};

describe('createSigningFunctionMap', () => {
  it('navigates visible fields in page and position order, wrapping at the end', () => {
    const lowerField = new SignatureWidgetAnnotation('lower', 1, 40);
    const upperField = new SignatureWidgetAnnotation('upper', 1, 20);
    const nextPageField = new SignatureWidgetAnnotation('next-page', 2, 10);
    const hiddenField = new SignatureWidgetAnnotation('hidden', 1, 10, false);
    const fields = [
      { widgets: [lowerField] },
      { widgets: [nextPageField] },
      { widgets: [hiddenField] },
      { widgets: [upperField] },
    ];
    const { instance, jumpToField } = createInstance(fields);
    const functions = createSigningFunctionMap(instance);

    functions.onNextField();
    functions.onNextField();
    functions.onNextField();

    expect(jumpToField.mock.calls.map(([field]) => field.widgets[0])).toEqual([
      lowerField,
      nextPageField,
      upperField,
    ]);
  });

  it('signs the current signature widget', () => {
    const widget = new SignatureWidgetAnnotation('signature', 1, 10);
    const { instance } = createInstance([{ widgets: [widget] }]);
    const functions = createSigningFunctionMap(instance);

    functions.onSignCurrentField();

    expect(instance.UI.signSignatureWidget).toHaveBeenCalledWith(widget);
  });
});