import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, root, ''), ...process.env };
  const chatTarget = env.VITE_USE_LOCAL_CHAT === 'true'
    ? (env.LOCAL_CHAT_TARGET || 'http://127.0.0.1:5005')
    : (env.CHAT_PROXY_TARGET || env.VITE_CHAT_URL || 'https://vercel-chat-alpha.vercel.app');
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      proxy: {
        '/api/backend': {
          target: env.BACKEND_PROXY_TARGET || 'https://main-service-git-223812018767.northamerica-northeast1.run.app',
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api\/backend/, ''),
        },
        '/api/auth': {
          target: env.AUTH_PROXY_TARGET || 'https://auth-service-338917524320.northamerica-northeast1.run.app',
          changeOrigin: true,
          cookieDomainRewrite: '',
          rewrite: p => p.replace(/^\/api\/auth/, ''),
        },
        '/api/chat-service': {
          target: chatTarget,
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api\/chat-service/, ''),
          configure(proxy) {
            proxy.on('proxyReq', req => {
              if (env.LOCAL_CHAT_SERVICE_API_KEY) req.setHeader('X-API-Key', env.LOCAL_CHAT_SERVICE_API_KEY);
            });
          },
        },
      },
    },
  };
});
