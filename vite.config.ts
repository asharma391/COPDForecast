import { defineConfig } from 'vite';

export default defineConfig({
  base: '/COPDForecast/',
  // Preserve the cascade and numeric precision of the original stylesheet.
  build: { cssMinify: false },
});
