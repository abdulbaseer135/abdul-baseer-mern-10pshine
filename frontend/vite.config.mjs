import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);
  // Compatibility for existing local environment files; production uses Vite names.
  const apiUrl = env.VITE_API_URL || (mode !== 'production' ? env.REACT_APP_API_URL : '');
  if (mode === 'production') {
    const url = new URL(apiUrl || 'about:blank');
    if (url.protocol !== 'https:' || url.pathname.replace(/\/+$/, '') !== '/api/v1') {
      throw new Error('Set VITE_API_URL to https://<backend-host>/api/v1 before building production.');
    }
  }
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_URL': JSON.stringify(apiUrl || ''),
      'process.env.VITE_ENABLE_SOCKET_IO': JSON.stringify(env.VITE_ENABLE_SOCKET_IO || env.REACT_APP_ENABLE_SOCKET_IO || 'false'),
    },
    build: { outDir: 'build' },
    server: { port: 3000, strictPort: true },
  };
});
