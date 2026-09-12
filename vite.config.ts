import { defineConfig } from 'vite';

export default defineConfig({
  // Keep assets relative so repository renames do not break Pages deployments.
  base: './',
  // Preserve the cascade and numeric precision of the original stylesheet.
  build: { cssMinify: false },
});
