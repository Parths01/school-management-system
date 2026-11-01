import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Use IPv4 loopback explicitly to avoid localhost IPv4/IPv6 resolution issues on Windows.
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
