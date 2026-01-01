import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || '0.0.0'),
    },
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      }
    }
  };
});
