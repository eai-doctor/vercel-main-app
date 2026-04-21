import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'screenshot-saver',
      configureServer(server) {
        server.middlewares.use('/save-screenshot', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename, data } = JSON.parse(body);
              const base64 = data.replace(/^data:image\/\w+;base64,/, '');
              const dir = path.resolve(__dirname, 'public/screenshots');
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(path.join(dir, filename), Buffer.from(base64, 'base64'));
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ ok: true }));
            } catch(e) { res.statusCode = 500; res.end(e.message); }
          });
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
