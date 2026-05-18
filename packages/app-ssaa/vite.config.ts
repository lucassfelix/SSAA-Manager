import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const neofrontPath = path.resolve(__dirname, "../neofront/src");

const rawBase = process.env.VITE_BASE_PATH;
const base =
  !rawBase || rawBase === "/"
    ? "/"
    : rawBase.endsWith("/")
      ? rawBase
      : `${rawBase}/`;

export default defineConfig({
  base,
  build: {
    sourcemap: false,
  },
  server: {
    port: 5173,
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
