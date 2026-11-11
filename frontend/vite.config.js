import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    fs: { allow: ['..'] }, // design-system/ et assets/ sont à la racine du dépôt
    proxy: { '/api': process.env.API_URL || 'http://localhost:3000' },
  },
});
