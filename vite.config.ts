import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup.html",
        content: "src/scripts/content.ts",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") {
            return "content_script.js";
          }
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          return "[name].js";
        },
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "popup.html") {
            return "popup.html";
          }
          if (assetInfo.name === "popup.css") {
            return "popup.css";
          }
          return "[name].[ext]";
        },
      },
    },
    sourcemap: false,
    minify: true,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
