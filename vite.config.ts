import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const blobProxyTarget = env.VITE_BLOB_PROXY_TARGET || 'https://doctransstor163828.blob.core.windows.net';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api/blob': {
          target: blobProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/blob/, ''),
        },
      },
    },
  };
});
