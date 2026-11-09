import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: { env: { PGLITE_DIR: "memory" }, testTimeout: 30000 },
  // Client-Hilfsfunktionen aus .tsx-Dateien testbar machen (React 17+ JSX-Transform).
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "server-only": path.resolve(__dirname, "tests/server-only-stub.ts"), "@": path.resolve(__dirname, "src") } },
});
