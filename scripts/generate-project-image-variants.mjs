import path from 'node:path';
import { mkdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { baseProjects } from '../src/data/projectRecords.js';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const displayWidth = 1600;
const thumbnailWidth = 320;

function toVariantPath(src, variant) {
  const match = src.match(/^(.*)\.([a-zA-Z0-9]+)$/);

  if (!match) {
    return null;
  }

  const extension = match[2].toLowerCase();

  if (!['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    return null;
  }

  return `${match[1]}-${variant}.jpg`;
}

function getSourceScreens(project) {
  if (project.gallery?.length) {
    return project.gallery.map((screen) => screen.src);
  }

  return project.heroImage ? [project.heroImage] : [];
}

function shouldRegenerate(sourcePath, outputPath) {
  if (!existsSync(outputPath)) {
    return true;
  }

  return statSync(sourcePath).mtimeMs > statSync(outputPath).mtimeMs;
}

function generateVariant(sourceRelativePath, variant, maxSize) {
  const outputRelativePath = toVariantPath(sourceRelativePath, variant);

  if (!outputRelativePath) {
    return;
  }

  const sourcePath = path.join(publicDir, sourceRelativePath.replace(/^\//, ''));
  const outputPath = path.join(publicDir, outputRelativePath.replace(/^\//, ''));

  if (!existsSync(sourcePath)) {
    return;
  }

  if (!shouldRegenerate(sourcePath, outputPath)) {
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });

  const result = spawnSync(
    '/usr/bin/sips',
    ['-s', 'format', 'jpeg', '-Z', String(maxSize), sourcePath, '--out', outputPath],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    throw new Error(`Failed to create ${variant} image for ${sourceRelativePath}.`);
  }
}

const uniqueSources = Array.from(
  new Set(baseProjects.flatMap((project) => getSourceScreens(project)).filter(Boolean))
);

for (const sourceRelativePath of uniqueSources) {
  generateVariant(sourceRelativePath, 'display', displayWidth);
  generateVariant(sourceRelativePath, 'thumb', thumbnailWidth);
}

console.log(`Generated responsive image variants for ${uniqueSources.length} source images.`);
