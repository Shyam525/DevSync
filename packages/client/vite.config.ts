import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ─── WHY THIS ALIAS IS REQUIRED ────────────────────────────────────────
//
// You will import from '@devsync/shared' in your React code, exactly
// like the server does. On the server, npm workspaces + tsconfig
// "paths" made that work automatically.
//
// Vite is DIFFERENT. Vite's dev server (esbuild) does NOT read
// tsconfig "paths" — that setting only affects TypeScript's type
// checker, not the actual bundler. Without this alias, you get:
// "Failed to resolve import '@devsync/shared'"
// even though the exact same import works fine on the server.
// This trips up almost everyone the first time they use a monorepo
// with Vite. Now you know why, before you hit it.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@devsync/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
