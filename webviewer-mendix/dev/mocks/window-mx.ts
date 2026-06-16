/**
 * Mock for the Mendix client API accessed via window.mx
 * See: src/WebViewer.tsx (mx prop) and src/clients/WebViewerModuleClient.tsx
 *
 * Only the surface area used by the widget is mocked:
 *   - window.mx.session.getConfig("csrftoken")
 *   - window.mx.session.getUserId()  (not currently used, but commonly needed)
 *
 * Imported at the top of dev/main.tsx BEFORE React renders so that
 * the widget sees window.mx on first render.
 */

interface MockMx {
    session: {
        getConfig: (key: string) => string | undefined;
        getUserId: () => string | undefined;
    };
    widgets: Record<string, unknown>;
}

const mockMx: MockMx = {
    session: {
        getConfig: (key: string) => {
            if (key === "csrftoken") {
                return "mock-csrf-token-for-dev-testing";
            }
            return undefined;
        },
        getUserId: () => "dev-user"
    },
    widgets: {}
};

(window as unknown as { mx: MockMx }).mx = mockMx;

export default mockMx;
