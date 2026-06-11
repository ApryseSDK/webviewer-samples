# WebViewer Mendix Widget - Local Dev Test Harness

A standalone Vite-based test harness for the WebViewer Mendix widget.
Allows you to test the widget **without a Mendix Studio Pro installation**.

## Quick Start

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Install the MSW service worker (only needed once)
npm run dev:test:install-sw

# 3. Start the dev server
npm run dev:test
```

Then open <http://localhost:3001> in your browser.

## What It Does

- Mocks `window.mx` (the Mendix client API) so the widget can call `mx.session.getConfig("csrftoken")` without a real Mendix runtime.
- Intercepts the Mendix REST API endpoints (`/rest/...`) using MSW (Mock Service Worker).
- Serves the Apryse WebViewer library files from `node_modules/@pdftron/webviewer/public` at `/resources/lib/*` so the viewer can load its worker scripts and WASM modules.
- Provides an interactive sidebar that exposes **every property from `src/WebViewer.xml`** as a control, allowing real-time toggling.

## File Layout

```
dev/
├── index.html              # Vite entry HTML
├── main.tsx                # React entry that mounts the test harness
├── components/
│   ├── ControlPanel.tsx       # Interactive sidebar
│   ├── PropertyGroup.tsx      # Reusable accordion group
│   ├── ToggleControl.tsx      # Boolean toggle switch
│   ├── TextInputControl.tsx   # String text input
│   ├── TextareaControl.tsx    # Multiline string textarea
│   ├── SelectControl.tsx      # Enumeration dropdown
│   ├── NumberInputControl.tsx # Integer number input
│   └── widgetState.ts         # WidgetState type + defaults
├── mocks/
│   ├── window-mx.ts        # Mocks window.mx
│   └── handlers.ts         # MSW REST API handlers
└── public/
    └── mockServiceWorker.js  # MSW worker (auto-installed by `npm run dev:test:install-sw`)
```

## What You Can Test

| Feature | Status |
|---|---|
| Document loading from URL | ✅ |
| `loadAsPDF` conversion | ✅ |
| Office editing mode | ✅ |
| Annotations (all tools) | ✅ |
| Dark mode / language | ✅ |
| Theme, layout, panels | ✅ |
| Real-time property toggling | ✅ |
| XFDF import/export (mocked) | ⚠️ Partial |
| File entity (Mendix FileDocument) | ❌ Use `fileUrl` instead |
| Real-time annotating | ⚠️ Mocks accept requests but don't persist |
| Page extraction to Mendix | ⚠️ Download works; upload is mocked |

## Resetting

Click the **Reset** button in the sidebar to restore all properties to the
defaults specified in `src/WebViewer.xml`.

## Troubleshooting

- **Blank viewer area** — Open the browser console. If you see 404 errors
  for `/resources/lib/...`, verify `node_modules/@pdftron/webviewer/public` exists.
- **MSW not intercepting** — Confirm the service worker is registered by
  running `npm run dev:test:install-sw` and checking that `dev/public/mockServiceWorker.js` exists.
- **Watermarks on the document** — Set a valid Apryse license key in the
  `License` section of the control panel.
