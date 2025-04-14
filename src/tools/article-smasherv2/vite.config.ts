import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/tools/article-smasherv2/',
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Make environment variables available to the client-side code
      // Replace process.env.* with import.meta.env.*
      'process.env.REACT_APP_RECAPTCHA_SITE_KEY': JSON.stringify(env.REACT_APP_RECAPTCHA_SITE_KEY || ''),
      // Add any other environment variables that might be needed
      'process.env': JSON.stringify({}),
    },
  };
});
