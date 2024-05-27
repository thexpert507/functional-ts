import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: { main: resolve(__dirname, "lib/index.ts") },
      formats: ["es", "cjs"],
      name: "@functional-ts/react",
      fileName: (format, chunk) => {
        if (format === "cjs") return `${format}/${chunk}.cjs`;
        return `${format}/${chunk}.js`;
      },
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@functional-ts/monads",
        "@functional-ts/core",
        "@functional-ts/http",
      ],
    },
  },
  plugins: [react(), dts()],
});
