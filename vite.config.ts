import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const enableHmr = env.VITE_ENABLE_HMR === 'true';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Some hosted previews/proxies close the Vite WebSocket before it opens.
      // Keep HMR opt-in so the app works reliably in those environments.
      hmr: enableHmr ? { clientPort: 3000 } : false,
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
