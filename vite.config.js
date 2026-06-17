import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from https://<user>.github.io/<repo>/
  base: process.env.VITE_BASE || '/',
});
