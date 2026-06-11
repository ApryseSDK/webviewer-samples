/**
 * MSW handlers that mock the Mendix REST API endpoints called by
 * src/clients/WebViewerModuleClient.tsx
 *
 * Endpoints intercepted:
 *   GET  /rest/version/v1/modules/webviewer            -> 200 "OK"      (checkForModule)
 *   GET  /rest/documentstore/v1/documents/:id          -> JSON          (getFileInfo)
 *   PUT  /rest/documentstore/v1/documents/:id          -> 204           (updateFile)
 *   POST /rest/documentstore/v1/documents              -> text guid     (saveFile)
 *   GET  /rest/documentstore/v1/documents/:id/commands -> []            (getLatestXfdfCommands)
 *
 * Run via the browser worker in dev/main.tsx.
 */

import { http, HttpResponse, passthrough } from "msw";

export const handlers = [
    // Module check endpoint
    http.get("/rest/version/v1/modules/webviewer", () => {
        return new HttpResponse("OK", { status: 200 });
    }),

    // File info endpoint
    http.get("/rest/documentstore/v1/documents/:id", ({ params }) => {
        return HttpResponse.json({
            guid: params.id,
            filename: "test.pdf",
            size: 1024
        });
    }),

    // Update file endpoint
    http.put("/rest/documentstore/v1/documents/:id", () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // Save file endpoint - returns a fake GUID
    http.post("/rest/documentstore/v1/documents", () => {
        return HttpResponse.text("mock-new-file-guid-" + Date.now());
    }),

    // XFDF commands endpoints
    http.get("/rest/documentstore/v1/documents/:id/commands", () => {
        return HttpResponse.json([]);
    }),

    // POST XFDF command endpoint
    http.post("/rest/documentstore/v1/documents/:id/commands", () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // Catch-all: explicitly passthrough so the network layer can do its
    // own thing without throwing. The "Failed to fetch" error came from
    // a passthrough() throwing when the request was non-fetchable.
    http.all("/rest/*", () => {
        return new HttpResponse(null, { status: 204 });
    })
];

// Unused but kept for reference - uncomment if you want true passthrough
// const _passthrough = passthrough;
