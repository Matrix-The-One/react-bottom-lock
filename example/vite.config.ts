import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base =
  process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : "/";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  lint: {
    ignorePatterns: ['dist/**', 'playwright-report/**', 'test-results/**'],
    env: {
      browser: true,
      node: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ['react', 'typescript', 'oxc'],
    rules: {
      'react/exhaustive-deps': 'warn',
      'react/only-export-components': 'warn',
      'react/rules-of-hooks': 'error',
    },
  },
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
