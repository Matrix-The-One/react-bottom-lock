import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const entry = fileURLToPath(new URL("./src/index.ts", import.meta.url));

export default defineConfig({
  fmt: {
    ignorePatterns: ["dist/**", "example/**", "README*.md", "LICENSE", "NOTICE.md"],
  },
  lint: {
    ignorePatterns: ["dist/**", "example/**"],
    env: {
      browser: true,
      node: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/exhaustive-deps": "warn",
      "react/rules-of-hooks": "error",
    },
  },
  pack: {
    entry: [entry],
    dts: true,
    format: ["esm", "cjs"],
    sourcemap: true,
    target: "es2022",
    platform: "neutral",
    deps: {
      neverBundle: ["react"],
    },
  },
});
