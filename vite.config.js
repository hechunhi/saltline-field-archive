import { cpSync } from "node:fs";
import { defineConfig } from "vite";

// The catalog is a standalone page (classic engine.js + unbundled modules that
// hash original/game.js). Ship it verbatim next to the built game.
const copyCatalog = {
  name: "copy-catalog",
  apply: "build",
  closeBundle() {
    for (const path of ["catalog.html", "catalog", "assets/fonts", "assets/katex", "original"])
      cpSync(path, `dist/${path}`, { recursive: true });
  },
};

export default defineConfig({
  base: "./",
  plugins: [copyCatalog],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    sourcemap: true,
  },
});
