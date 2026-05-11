import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/__auth": {
        target: "https://envId-appid.tcloudbaseapp.com/",
        changeOrigin: true,
      },
    },
    allowedHosts: true,
  },
});
