import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const webviewerPublic = path.resolve(__dirname, "node_modules/@pdftron/webviewer/public");

/**
 * Vite config for the standalone dev test harness.
 *
 * - root: "dev" so Vite serves dev/index.html
 * - publicDir: "public" so dev/public/mockServiceWorker.js is available at /mockServiceWorker.js
 * - Custom middleware: streams /resources/lib/* from the installed @pdftron/webviewer package
 *   so the viewer can load its worker scripts and WASM files.
 * - optimizeDeps.include: pre-bundles @pdftron/webviewer (UMD) as ESM so its default export works
 *   when imported in src/components/PDFViewer.tsx.
 */
export default defineConfig({
    root: "dev",
    publicDir: "public",
    plugins: [
        react(),
        {
            name: "webviewer-assets-middleware",
            configureServer(server) {
                server.middlewares.use("/resources/lib", (req, res, next) => {
                    // Strip the /resources/lib prefix, query string, and any leading slashes
                    // so that `..` segments cannot escape the webviewer public directory.
                    const url = (req.url || "/").split("?")[0].replace(/^\/+/, "");
                    // Use path.resolve against an explicit "." anchor and then verify the
                    // resolved path is still under webviewerPublic. Anything else gets 403.
                    const filePath = path.resolve(webviewerPublic, "." + path.sep + url);
                    const webviewerPublicWithSep = webviewerPublic.endsWith(path.sep)
                        ? webviewerPublic
                        : webviewerPublic + path.sep;
                    if (filePath !== webviewerPublic && !filePath.startsWith(webviewerPublicWithSep)) {
                        res.statusCode = 403;
                        return res.end("Forbidden");
                    }
                    const fs = require("fs") as typeof import("fs");
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                        const ext = path.extname(filePath).toLowerCase();
                        const mimeTypes: Record<string, string> = {
                            ".js": "application/javascript",
                            ".css": "text/css",
                            ".html": "text/html",
                            ".json": "application/json",
                            ".wasm": "application/wasm",
                            ".svg": "image/svg+xml",
                            ".png": "image/png",
                            ".jpg": "image/jpeg",
                            ".woff": "font/woff",
                            ".woff2": "font/woff2",
                            ".ttf": "font/ttf",
                            ".txt": "text/plain"
                        };
                        res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
                        res.setHeader("Cache-Control", "no-cache");
                        fs.createReadStream(filePath).pipe(res);
                        return;
                    }
                    next();
                });
            }
        }
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        port: 3001,
        host: true,
        fs: {
            // Allow serving files from node_modules
            allow: [".."]
        }
    },
    optimizeDeps: {
        // Pre-bundle @pdftron/webviewer so its UMD/CommonJS default export
        // is wrapped into a proper ESM module with a `default` export.
        include: ["@pdftron/webviewer"]
    }
});
