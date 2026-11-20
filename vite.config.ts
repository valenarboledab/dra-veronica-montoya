import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // The hero films and stills live in public/media and are served as-is.
    target: 'es2020',
  },
});
