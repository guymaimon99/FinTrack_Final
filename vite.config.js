import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Use '@' for imports
    },
  },
  build: {
    outDir: 'dist', // Build output
    emptyOutDir: true, // Remove old files before building
    rollupOptions: {
      input: './index.html', // Ensure the correct entry point
    },
  },
});
