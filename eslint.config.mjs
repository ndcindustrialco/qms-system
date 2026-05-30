import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Local architecture-guardrail plugin (no npm install needed)
const ndcRules = require("./eslint-rules/index.js");

const eslintConfig = [
  {
    ignores: [".next/**", "generated/**", "node_modules/**", "next-env.d.ts", "docs/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Architecture guardrails — apply to all TS/JS source files
    files: ["app/api/**/*.ts", "services/**/*.ts"],
    plugins: {
      ndc: ndcRules,
    },
    rules: {
      "ndc/no-db-in-api": "error",
    },
  },
];

export default eslintConfig;
