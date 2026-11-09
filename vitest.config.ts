import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: { env: { PGLITE_DIR: "memory" }, testTimeout: 30000 },
  resolve: { alias: { "server-only": path.resolve(__dirname, "tests/server-only-stub.ts"), "@": path.resolve(__dirname, "src") } },
});
