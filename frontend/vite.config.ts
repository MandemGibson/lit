import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-core';
            }
            if (id.includes('lottie-web')) {
              return 'vendor-lottie';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  }
});
