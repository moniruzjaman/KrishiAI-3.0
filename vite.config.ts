
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Safely inject env vars into the browser context
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || null),
    'process.env.SUPABASE_KEY': JSON.stringify(process.env.SUPABASE_KEY || null),
    'process.env.HF_TOKEN': JSON.stringify(process.env.HF_TOKEN || null)
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
