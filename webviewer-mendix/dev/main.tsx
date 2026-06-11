/**
 * Dev Test Harness - entry point for the standalone Vite dev server.
 *
 * 1. Initialize window.mx mock BEFORE React imports
 * 2. Mount <ControlPanel> and <PDFViewer> side by side immediately
 * 3. Start MSW worker in the background (does not block the UI)
 * 4. Persist settings to localStorage so they survive page reloads
 * 5. Allow forcing a remount of the WebViewer instance via "Restart" button
 *
 * Run with: npm run dev:test
 */
import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { setupWorker } from "msw/browser";

// 1. Mock window.mx BEFORE any widget code runs
import "./mocks/window-mx";

// 2. Import the widget source (uses window.mx via the mock)
import PDFViewer from "../src/components/PDFViewer";
import { ControlPanel } from "./components/ControlPanel";
import { defaultState, WidgetState } from "./components/widgetState";
import { useLocalStorage } from "./components/useLocalStorage";

// 3. Import MSW handlers
import { handlers } from "./mocks/handlers";

import "../src/ui/WebViewer.css";

const STORAGE_KEY = "webviewer-dev-harness-state";

const App: React.FC = () => {
    // Persist settings across page reloads
    const [state, setState] = useLocalStorage<WidgetState>(STORAGE_KEY, defaultState);
    const [collapsed, setCollapsed] = useState(false);

    // instanceKey is appended to the PDFViewer's React key to force a full
    // unmount/remount of the WebViewer instance. Bumping this number disposes
    // the old instance (via the useEffect cleanup in PDFViewer.tsx) and creates
    // a new one with the current props.
    const [instanceKey, setInstanceKey] = useState(0);

    const handleRestart = useCallback(() => {
        setInstanceKey(k => k + 1);
    }, []);

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
            <ControlPanel
                state={state}
                onChange={setState}
                collapsed={collapsed}
                onToggleCollapsed={() => setCollapsed(c => !c)}
                onRestartViewer={handleRestart}
            />
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <PDFViewer
                    key={instanceKey}
                    // File
                    fileUrl={state.fileUrl}
                    enableFilePicker={state.enableFilePicker}
                    loadAsPDF={state.loadAsPDF}
                    // Editing
                    enablePdfEditing={state.enablePdfEditing}
                    enableOfficeEditing={state.enableOfficeEditing}
                    enableSpreadsheetEditing={state.enableSpreadsheetEditing}
                    // Page Extraction
                    enablePageExtraction={state.enablePageExtraction}
                    allowExtractionDownload={state.allowExtractionDownload}
                    // Other
                    enableFullAPI={state.enableFullAPI}
                    // Annotations - User
                    annotationUser={state.annotationUser}
                    // Annotations - Options
                    enableAnnotations={state.enableAnnotations}
                    enableMeasurement={state.enableMeasurement}
                    enableRedaction={state.enableRedaction}
                    selectAnnotationOnCreation={state.selectAnnotationOnCreation}
                    // XFDF
                    enableXfdfExportButton={state.enableXfdfExportButton}
                    enableAutoXfdfExport={state.enableAutoXfdfExport}
                    enableAutoXfdfImport={state.enableAutoXfdfImport}
                    // UI
                    isVisible={state.isVisible}
                    containerHeight={state.containerHeight}
                    enableDarkMode={state.enableDarkMode}
                    defaultLanguage={state.defaultLanguage}
                    notesInLeftPanel={state.notesInLeftPanel}
                    enabledElements={state.enabledElements}
                    disabledElements={state.disabledElements}
                    customCss={state.customCss}
                    // Accessibility
                    accessibleMode={state.accessibleMode}
                    highContrastMode={state.highContrastMode}
                    // Module
                    enableDocumentUpdates={state.enableDocumentUpdates}
                    enableSaveAsButton={state.enableSaveAsButton}
                    enableRealTimeAnnotating={state.enableRealTimeAnnotating}
                    autoXfdfCommandImportInterval={state.autoXfdfCommandImportInterval}
                    allowSavingToMendix={state.allowSavingToMendix}
                    // License
                    l={state.l}
                    // Mendix props
                    mx={(window as unknown as { mx: unknown }).mx}
                    xfdfAttribute={
                        {
                            status: "unavailable",
                            value: "",
                            setValue: () => undefined
                        }
                    }
                />
            </div>
        </div>
    );
};

// Mount React IMMEDIATELY so the user can interact with the control panel
// while MSW boots in the background.
const container = document.getElementById("root");
if (!container) {
    throw new Error("Root container #root not found in index.html");
}
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Start MSW worker in the background - non-blocking.
const worker = setupWorker(...handlers);
worker
    .start({
        serviceWorker: {
            url: "/mockServiceWorker.js"
        },
        // Don't throw on unhandled requests - they fall through to the dev server
        // (which returns 404 or index.html, both non-fatal for our use case)
        onUnhandledRequest: "bypass",
        quiet: true
    })
    .catch(err => {
        console.warn("[MSW] Failed to start service worker. REST mocks disabled.", err);
    });
