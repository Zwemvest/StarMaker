/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/StarMaker/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // Exclude throwaway GSD agent worktrees — they hold stale source/test copies
    // that otherwise pollute and massively inflate the test run.
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
});
