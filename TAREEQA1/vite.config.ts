import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  build: {
    outDir: './dist/renderer',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/renderer': path.resolve(__dirname, './src/renderer'),
      '@/main': path.resolve(__dirname, './src/main'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
  define: {
    global: 'globalThis',
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
});
