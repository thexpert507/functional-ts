// vite.config.js
/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import commonjsPlugin from "@chialab/esbuild-plugin-commonjs";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        main: resolve(__dirname, "lib/index.ts"),
        do: resolve(__dirname, "lib/monads/do/index.ts"),
      },
      name: "monads-ts",
      // the proper extensions will be added
      fileName: (format, chunk) => `${format}/${chunk}.js`,
    },
  },
  plugins: [dts(), commonjsPlugin()],
  test: {
    watch: false,
  },
});
