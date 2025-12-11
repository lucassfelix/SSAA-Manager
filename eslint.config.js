import js from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ignores: ["**/__*/*"],
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: ["warn", "all"],
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

      "@stylistic/member-delimiter-style": "warn",
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/curly-newline": ["warn", {
        "IfStatementConsequent": "always",
        "IfStatementAlternate": "always",
        "DoWhileStatement": "always",
        "ForInStatement": "always",
        "ForOfStatement": "always",
        "ForStatement": "always",
        "WhileStatement": "always"
      }],
    },
  }
]);