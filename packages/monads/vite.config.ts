// vite.config.js
/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import commonjsPlugin from "@chialab/esbuild-plugin-commonjs";

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, "lib/index.ts"),
        do: resolve(__dirname, "lib/monads/do/index.ts"),
      },
      formats: ["es", "cjs"],
      name: "@functional-ts/monads",
      fileName: (format, chunk) => {
        if (format === "cjs") return `${format}/${chunk}.cjs`;
        return `${format}/${chunk}.js`;
      },
    },
  },
  plugins: [dts(), commonjsPlugin()],
  test: { watch: false },
});
