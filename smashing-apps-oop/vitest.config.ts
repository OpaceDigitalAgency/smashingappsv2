import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/tools/graphics-smasher/**/*.{ts,tsx}']
    }
  }
});
