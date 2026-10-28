import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4200,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  preview: {
    port: 4200,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
