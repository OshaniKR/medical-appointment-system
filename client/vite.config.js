import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api calls to the Express server so no CORS setup is needed in dev
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
