import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const neofrontPath = path.resolve(__dirname, "../neofront/src");

export default defineConfig({
  build: {
    sourcemap: false,
  },
  server: {
    port: 5174,
    sourcemapIgnoreList: () => true
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@neofront/core": path.resolve(neofrontPath, "index.ts"),
      "@": path.resolve(neofrontPath, "components"),
      "context": path.resolve(neofrontPath, "contexts", "index.ts"),
      "project": path.resolve(__dirname, "project/"),
    },
  },
});
