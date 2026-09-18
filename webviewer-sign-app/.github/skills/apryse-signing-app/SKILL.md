---
name: webviewer-sign-app
description: Build a client-side, multi-signer PDF signing web app using Apryse (PDFTron) WebViewer, React, and Vite. Use this when the user wants to create a new signing/e-sign sample app, add multi-user signing to a WebViewer app, customize the WebViewer modular UI toolbar, or scope signature fields/annotations per user. Not for server-side signing, certificate-based digital signatures, or non-Apryse PDF viewers.
---

# Apryse WebViewer Signing App

Build a no-backend, client-side PDF signing sample: a React + Vite app that embeds
Apryse WebViewer, lets multiple local "signers" take turns filling out signature
fields in the same document, and scopes each signer's saved signatures/initials and
visible fields to only them.

## Architecture

- **React + Vite** app, no TypeScript, no backend/auth/database.
- `@pdftron/webviewer` npm package provides the viewer engine + UI.
- Static WebViewer assets (`core/`, `ui/`) must be served from `public/webviewer` —
  copied there by a `postinstall` script since they can't be bundled by Vite.
- A single PDF such as `public/contract.pdf` with pre-existing signature form
  fields, each field assigned to a specific user via `field.getUser()` / form
  field "user" property (set when authoring the PDF, e.g. in Apryse WebViewer's
  form builder or another tool).
- The current sample tracks two local signers, `toby-mcdermott` and
  `jennifer-davies`, with signer identity stored client-side only (`activeSignerId`
  ref) — this is a demo pattern, not real authentication.

## Project setup

1. `package.json` dependencies: `@pdftron/webviewer`, `react`, `react-dom`,
   `fs-extra` (for the copy script). Dev deps: `vite`, `@vitejs/plugin-react`.
2. Add a `postinstall` script that copies WebViewer's static files into `public/`:
   ```js
   // tools/copy-webviewer-files.js
   const fs = require('fs-extra');
   fs.copy('./node_modules/@pdftron/webviewer/public', './public/webviewer');
   ```
   Wire it up: `"postinstall": "node tools/copy-webviewer-files.js"`.
3. In `index.html`, load the core WebViewer scripts before the app module so
   `fullAPI` (PDFNet) works, and reference `/webviewer/...` (the copied path):
   ```html
   <script src="/webviewer/core/webviewer-core.min.js"></script>
   <script src="/webviewer/core/pdf/PDFNet.js"></script>
   <script type="module" src="/src/main.jsx"></script>
   ```
4. Standard Vite entry (`src/main.jsx`) renders `<App />` into `#root`.

## Initializing WebViewer

Instantiate once in a `useEffect` with an empty dependency array, guard against
double-mount/unmount races (React StrictMode), and always clean up:

```jsx
WebViewer(
  {
    path: 'webviewer',       // matches public/webviewer
    fullAPI: true,           // needed for form field / advanced APIs
    initialDoc: 'contract.pdf',
    disabledElements: ['leftPanel', 'leftPanelButton'],
  },
  viewer.current,
).then(instance => {
  if (cancelled || !viewer.current) {
    instance?.UI?.closeDocument?.();
    return;
  }
  instanceRef.current = instance;
  // ... enable features, set up listeners
});

return () => {
  cancelled = true;
  cleanupRef.current.forEach(cleanup => cleanup());
  instanceRef.current?.UI?.closeDocument?.();
  instanceRef.current?.destroy?.();
};
```

Key setup calls after init:
- `instance.UI.enableFeatures([instance.UI.Feature.Initials])` — allow initials, not just full signatures.
- `instance.UI.showFormFieldIndicators()` — show "Sign Here" style badges.
- `instance.Core.annotationManager.setCurrentUser(signerId)` — tags new annotations with the acting user.

## Per-signer isolation pattern

This is the core reusable pattern for any multi-user document workflow, and the
current demo uses the same pattern for the two signers in the sample UI:
`Toby McDermott` and `Jennifer Davies`.

1. **Store signatures per signer** in a `useRef(new Map())`, keyed by signer id,
   holding `{ signatures, initials }` arrays from
   `signatureTool.getSavedSignatures()` / `getSavedInitials()`.
2. **On signer switch**: save the outgoing signer's saved signatures/initials into
   the map, then call `signatureTool.deleteAllSavedSignatures()` /
   `deleteAllSavedInitials()`, then restore the incoming signer's saved set via
   `signatureTool.saveSignatures(...)` / `saveInitials(...)`. Guard restoration with
   an `isRestoringSignatures` ref so save-triggered listeners don't clobber state.
3. **Filter which signature appearances are visible**:
   ```js
   instance.UI.setDisplayedSignaturesFilter(annotation => {
     const ownerId = annotation?.getCustomData?.('ownerSignerId') || '';
     return ownerId === signerId;
   });
   ```
   Tag each newly saved signature annotation with
   `annotation.setCustomData('ownerSignerId', activeSignerId.current)` in the
   `signatureSaved` UI event handler.
4. **Show/hide form field widgets by owner**: iterate
   `annotationManager.getFieldManager().getFields()`, compare `field.getUser()` to
   the active signer id, and call `annotationManager.showAnnotations(widgets)` /
   `hideAnnotations(widgets)` accordingly. Recompute after the annotation
   `annotationsLoaded` event and whenever a signature is added/removed.
5. **Highlight the next unsigned field** for the active signer: sort visible
   `SignatureWidgetAnnotation`s by page/Y/X, find the first where
   `!widget.isSignedByAppearance()`, and use
   `formFieldCreationManager.setIndicatorText(widget, 'Sign Here' | 'Initials Here')`
   + `setShowIndicator(widget, true)`.

## Customizing the toolbar (Modular UI)

Use `instance.UI.importModularComponents(config, functionMap)` to add custom
buttons/elements without forking the whole UI. Pattern:

```js
export const signingUIConfig = {
  modularComponents: {
    nextFieldButton: { type: 'customButton', img: 'icon-chevron-right', label: 'Next field', title: 'Next field', onClick: 'onNextField' },
    // ... more buttons, a 'groupedItems' entry to cluster them
  },
  modularHeaders: {
    signingHeader: { placement: 'top', items: ['fileNameDisplay', 'centerToolbarItems', 'rightToolbarItems'], justifyContent: 'space-between' },
  },
};

export function createSigningFunctionMap(instance) {
  // return { onNextField: () => ..., onSignCurrentField: () => ..., onDownloadFlattened: () => ... }
}
```

Common custom actions:
- **Field navigation**: maintain a `currentFieldIndex` closure var, recompute the
  navigable field list (visible widgets only) on each call, and reset the index
  when the visible-field set changes (detect via a joined key of widget ids) so
  switching signers doesn't leave a stale/out-of-range index.
- **Sign current field**: `instance.UI.signSignatureWidget(widget)` opens the
  signature creation/adoption flow for a specific widget.
- **Download flattened PDF**:
  ```js
  instance.UI.downloadPdf({ filename: '...', includeAnnotations: true, flatten: true });
  ```
- Keep a highlight in sync with document/annotation events
  (`annotationsLoaded`, `annotationChanged`, `annotationHidden`,
  `updateAnnotationPermission`) rather than only on button clicks.

## Gotchas / lessons learned

- WebViewer's static assets are large binary/minified files — they belong in
  `public/`, copied post-install, **never committed as source you edit directly**.
- Always null-check `instance.UI`/`instance.Core` accessors with optional chaining
  when called from cleanup or async callbacks — the component may unmount before
  the `WebViewer()` promise resolves.
- `annotationManager.setCurrentUser` affects new annotation authorship
  (`getUser()`), not visibility — visibility is entirely managed by your own
  show/hide + `setDisplayedSignaturesFilter` logic.
- Use event `options.source` (e.g. `'signatureAppearanceAdded'`,
  `'signatureAppearanceRemoved'`) inside `annotationChanged` handlers to react only
  to signature-specific changes instead of every annotation edit.
- Prefer scoping custom data (`setCustomData`/`getCustomData`) over parallel
  bookkeeping structures when you need to associate metadata with an annotation
  that must survive save/restore cycles.

## Reference files in this repo

- [src/App.jsx](../../../src/App.jsx) — WebViewer init, signer switching, field/signature scoping.
- [src/signingUIConfig.js](../../../src/signingUIConfig.js) — modular toolbar config and field navigation/download logic.
- [tools/copy-webviewer-files.js](../../../tools/copy-webviewer-files.js) — postinstall asset copy.
- [index.html](../../../index.html) — WebViewer core script tags.
- [package.json](../../../package.json) — scripts and dependencies.
