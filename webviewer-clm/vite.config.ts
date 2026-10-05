import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
        allowedHosts: ['82b617d2c37c.ngrok-free.app']
      }
});
