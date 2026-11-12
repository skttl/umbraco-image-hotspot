import { defineConfig } from "vite";
import { readFileSync, writeFileSync } from "node:fs";

export default defineConfig({
  plugins: [{
    name: "package-version",
    closeBundle() {
      const manifest = JSON.parse(readFileSync("public/umbraco-package.json", "utf8"));
      manifest.version = process.env.PACKAGE_VERSION ?? manifest.version;
      writeFileSync("../wwwroot/umbraco-package.json", JSON.stringify(manifest, null, 2));
    },
  }],
  build: {
    lib: {
      entry: "src/entrypoint.ts", // Bundle registers one or more manifests
      formats: ["es"],
      fileName: "entrypoint",
    },
    outDir: "../wwwroot", // your web component will be saved in this location
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [/^@umbraco-cms\//],
    },
  },
});
