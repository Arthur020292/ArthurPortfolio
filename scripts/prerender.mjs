import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { build, loadEnv } from 'vite';
import { getIndexableRoutes, parsePortfolioRoute } from '../src/portfolio/routes.js';
import {
  buildPortfolioStructuredData,
  getPortfolioPageMeta,
  resolveSiteUrl,
  toAbsoluteUrl,
} from '../src/portfolio/seo.js';
import { replacePortfolioTemplate } from '../src/portfolio/htmlTemplate.js';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const env = loadEnv('production', projectRoot, '');
const siteUrl = resolveSiteUrl(env.VITE_SITE_URL, 'https://arthurbaduyen.dev');
const ssrTempDir = path.join(projectRoot, 'node_modules', '.cache', 'portfolio-prerender');

function extractEntryChunk(buildResult) {
  const outputs = Array.isArray(buildResult)
    ? buildResult.flatMap((result) => result.output ?? [])
    : buildResult.output ?? [];

  const entryChunk = outputs.find((item) => item.type === 'chunk' && item.isEntry);

  if (!entryChunk) {
    throw new Error('Unable to locate the SSR entry chunk.');
  }

  return entryChunk.code;
}

function getOutputPath(pathname) {
  if (pathname === '/') {
    return path.join(distDir, 'index.html');
  }

  return path.join(distDir, pathname.slice(1), 'index.html');
}

function buildSitemapXml(routes) {
  const entries = routes
    .map((pathname) => `  <url><loc>${toAbsoluteUrl(pathname, siteUrl)}</loc></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
const ssrBuildResult = await build({
  build: {
    rollupOptions: {
      inlineDynamicImports: true,
    },
    ssr: path.join(projectRoot, 'src/entry-server.jsx'),
    write: false,
  },
  configFile: path.join(projectRoot, 'vite.config.js'),
  logLevel: 'error',
});
const ssrEntryCode = extractEntryChunk(ssrBuildResult);
const ssrBundlePath = path.join(ssrTempDir, 'entry-server.mjs');

await mkdir(ssrTempDir, { recursive: true });
await writeFile(ssrBundlePath, ssrEntryCode);

const { render } = await import(pathToFileURL(ssrBundlePath).href);
const routes = getIndexableRoutes();

for (const pathname of routes) {
  const route = parsePortfolioRoute(pathname);
  const meta = getPortfolioPageMeta(route);
  const structuredData = buildPortfolioStructuredData(meta, siteUrl);
  const bodyHtml = render(pathname);
  const canonicalUrl = toAbsoluteUrl(meta.path, siteUrl);
  const imageUrl = toAbsoluteUrl(meta.imagePath, siteUrl);

  const html = replacePortfolioTemplate(template, {
    canonicalUrl,
    description: meta.description,
    imageUrl,
    jsonLd: structuredData,
    title: meta.title,
  }).replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

  const outputPath = getOutputPath(pathname);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemapXml(routes));
await writeFile(path.join(distDir, 'robots.txt'), buildRobotsTxt());
