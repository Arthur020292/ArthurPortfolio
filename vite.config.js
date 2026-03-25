import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sendContactEmail } from './api/_lib/contact.js';

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function contactApiPlugin() {
  return {
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestPath = req.url?.split('?')[0];

        if (requestPath !== '/api/contact') {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Allow', 'POST');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Method not allowed.' }));
          return;
        }

        try {
          // Reload env on every local API request so email testing picks up the
          // latest Resend key/recipient without needing a Vite restart.
          Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));

          const payload = await readJsonBody(req);
          const result = await sendContactEmail(payload);

          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: result.message }));
        } catch (error) {
          console.error('Contact API dev middleware failed:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              message: 'I could not send your message right now. Please try again later.',
            })
          );
        }
      });
    },
    name: 'contact-api-dev',
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), tailwindcss(), contactApiPlugin()],
  };
});
