import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ignores: ["**/__*/*"],
    rules: {
      curly: ["warn", "all"],
      semi: ["warn", "always"],
      "no-unused-vars": "off",
      "no-undef": "off",
      "nonblock-statement-body-position": ["warn", "below"],
      "no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 1 }],
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // "brace-style": ["warn", "1tbs", { "allowSingleLine": false }],
    },
  }
]);