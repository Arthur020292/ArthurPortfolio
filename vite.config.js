import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  buildPortfolioStructuredData,
  getPortfolioPageMeta,
  resolveSiteUrl,
  toAbsoluteUrl,
} from './src/portfolio/seo.js';
import { replacePortfolioTemplate } from './src/portfolio/htmlTemplate.js';
import { handleContactRequest } from './shared/contactRequest.js';

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
          const response = await handleContactRequest({
            env: process.env,
            origin: req.headers.origin,
            payload,
            remoteIp: req.socket.remoteAddress,
            requestOrigin: `http://${req.headers.host}`,
            secFetchMode: req.headers['sec-fetch-mode'],
            secFetchSite: req.headers['sec-fetch-site'],
          });

          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(await response.json()));
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

function stripCrossoriginPlugin() {
  return {
    apply: 'build',
    name: 'strip-crossorigin-attributes',
    transformIndexHtml: {
      handler(html) {
        return html.replace(/\s+crossorigin(?=(?:\s|>))/g, '');
      },
      order: 'post',
    },
  };
}

function portfolioMetaPlugin(siteUrl) {
  return {
    apply: 'serve',
    name: 'portfolio-meta-template',
    transformIndexHtml: {
      handler(html) {
        const homeMeta = getPortfolioPageMeta({ type: 'about' });
        const structuredData = buildPortfolioStructuredData(homeMeta, siteUrl);

        return replacePortfolioTemplate(html, {
          canonicalUrl: toAbsoluteUrl(homeMeta.path, siteUrl),
          description: homeMeta.description,
          imageUrl: toAbsoluteUrl(homeMeta.imagePath, siteUrl),
          jsonLd: structuredData,
          ogType: homeMeta.ogType,
          robots: homeMeta.robots,
          title: homeMeta.title,
        });
      },
      order: 'post',
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  const siteUrl = resolveSiteUrl(
    process.env.VITE_SITE_URL,
    'http://127.0.0.1:8082'
  );

  const plugins =
    mode === 'test'
      ? [react()]
      : [
          react(),
          tailwindcss(),
          portfolioMetaPlugin(siteUrl),
          stripCrossoriginPlugin(),
          contactApiPlugin(),
        ];

  return {
    plugins,
    test: {
      environment: 'node',
      globals: true,
    },
  };
});
