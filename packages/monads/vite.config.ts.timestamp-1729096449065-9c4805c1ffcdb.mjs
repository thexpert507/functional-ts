// vite.config.ts
import { resolve } from "node:path";
import { defineConfig } from "file:///Users/adrielavila/Documents/proyectos/personal/functional/node_modules/.pnpm/vite@5.3.4_@types+node@18.15.11/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/adrielavila/Documents/proyectos/personal/functional/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@18.15.11_rollup@4.17.2_typescript@5.4.5_vite@5.3.4_@types+node@18.15.11_/node_modules/vite-plugin-dts/dist/index.mjs";
import commonjsPlugin from "file:///Users/adrielavila/Documents/proyectos/personal/functional/node_modules/.pnpm/@chialab+esbuild-plugin-commonjs@0.18.0/node_modules/@chialab/esbuild-plugin-commonjs/lib/index.js";
var __vite_injected_original_dirname = "/Users/adrielavila/Documents/proyectos/personal/functional/packages/monads";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__vite_injected_original_dirname, "lib/index.ts"),
        do: resolve(__vite_injected_original_dirname, "lib/monads/do/index.ts")
      },
      formats: ["es", "cjs"],
      name: "@functional-ts/monads",
      fileName: (format, chunk) => {
        if (format === "cjs") return `${format}/${chunk}.cjs`;
        return `${format}/${chunk}.js`;
      }
    }
  },
  plugins: [dts(), commonjsPlugin()],
  test: { watch: false }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRyaWVsYXZpbGEvRG9jdW1lbnRzL3Byb3llY3Rvcy9wZXJzb25hbC9mdW5jdGlvbmFsL3BhY2thZ2VzL21vbmFkc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkcmllbGF2aWxhL0RvY3VtZW50cy9wcm95ZWN0b3MvcGVyc29uYWwvZnVuY3Rpb25hbC9wYWNrYWdlcy9tb25hZHMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkcmllbGF2aWxhL0RvY3VtZW50cy9wcm95ZWN0b3MvcGVyc29uYWwvZnVuY3Rpb25hbC9wYWNrYWdlcy9tb25hZHMvdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy5qc1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcbmltcG9ydCBjb21tb25qc1BsdWdpbiBmcm9tIFwiQGNoaWFsYWIvZXNidWlsZC1wbHVnaW4tY29tbW9uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiB7XG4gICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCBcImxpYi9pbmRleC50c1wiKSxcbiAgICAgICAgZG86IHJlc29sdmUoX19kaXJuYW1lLCBcImxpYi9tb25hZHMvZG8vaW5kZXgudHNcIiksXG4gICAgICB9LFxuICAgICAgZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIl0sXG4gICAgICBuYW1lOiBcIkBmdW5jdGlvbmFsLXRzL21vbmFkc1wiLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQsIGNodW5rKSA9PiB7XG4gICAgICAgIGlmIChmb3JtYXQgPT09IFwiY2pzXCIpIHJldHVybiBgJHtmb3JtYXR9LyR7Y2h1bmt9LmNqc2A7XG4gICAgICAgIHJldHVybiBgJHtmb3JtYXR9LyR7Y2h1bmt9LmpzYDtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW2R0cygpLCBjb21tb25qc1BsdWdpbigpXSxcbiAgdGVzdDogeyB3YXRjaDogZmFsc2UgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxvQkFBb0I7QUFMM0IsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTztBQUFBLFFBQ0wsTUFBTSxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUN2QyxJQUFJLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDakQ7QUFBQSxNQUNBLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUNyQixNQUFNO0FBQUEsTUFDTixVQUFVLENBQUMsUUFBUSxVQUFVO0FBQzNCLFlBQUksV0FBVyxNQUFPLFFBQU8sR0FBRyxNQUFNLElBQUksS0FBSztBQUMvQyxlQUFPLEdBQUcsTUFBTSxJQUFJLEtBQUs7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztBQUFBLEVBQ2pDLE1BQU0sRUFBRSxPQUFPLE1BQU07QUFDdkIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
