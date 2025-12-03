import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const neofrontPath = path.resolve(__dirname, "../neofront/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@neofront/core": path.resolve(neofrontPath, "index.ts"),
      "project": path.resolve(__dirname, "project/"),
    },
  },
});
