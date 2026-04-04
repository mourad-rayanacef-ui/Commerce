import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'frontend'),
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === 'true' ? true : undefined,
    host: process.env.TEMPO === 'true' ? '0.0.0.0' : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'frontend/dist'),
  },
});
