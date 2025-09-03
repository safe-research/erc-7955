import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/erc-7955/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
