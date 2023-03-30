/// <reference types="vitest" />

import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 3000,
  },
  logLevel: "info",
  esbuild: {
    sourcemap: "both",
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
});
