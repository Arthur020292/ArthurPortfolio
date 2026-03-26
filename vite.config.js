import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sendContactEmail } from './api/_lib/contact.js';
import {
  enforceContactRateLimit,
  getAllowedOrigins,
  isAllowedRequestOrigin,
  verifyTurnstileToken,
} from './shared/contactSecurity.js';

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
          const allowedOrigins = getAllowedOrigins(process.env.CONTACT_ALLOWED_ORIGINS);
          const requestOrigin = `http://${req.headers.host}`;
          const origin = req.headers.origin;

          if (!isAllowedRequestOrigin({ allowedOrigins, origin, requestOrigin })) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Origin not allowed.' }));
            return;
          }

          const rateLimitResult = enforceContactRateLimit({
            key: req.socket.remoteAddress,
            maxRequests: Number(process.env.CONTACT_RATE_LIMIT_MAX || 5),
            windowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 600000),
          });

          if (!rateLimitResult.ok) {
            res.statusCode = rateLimitResult.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: rateLimitResult.message }));
            return;
          }

          const turnstileResult = await verifyTurnstileToken({
            remoteIp: req.socket.remoteAddress,
            secretKey: process.env.TURNSTILE_SECRET_KEY,
            token: payload?.turnstileToken,
          });

          if (!turnstileResult.ok) {
            res.statusCode = turnstileResult.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: turnstileResult.message }));
            return;
          }

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

  const plugins = mode === 'test' ? [react()] : [react(), tailwindcss(), contactApiPlugin()];

  return {
    plugins,
    test: {
      environment: 'node',
      globals: true,
    },
  };
});
