import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        status: path.resolve(__dirname, "status/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "$/": `${path.resolve(__dirname, "src")}/`,
      "$status/": `${path.resolve(__dirname, "status/src")}/`,
    },
  },
});
