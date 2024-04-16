// vite.config.js
/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "lib/index.ts"),
      name: "monads-ts",
      // the proper extensions will be added
      fileName: "main",
    },
  },
  plugins: [dts()],
  test: {
    watch: false,
  },
});
