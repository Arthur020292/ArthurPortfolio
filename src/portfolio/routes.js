import { getProjectBySlug, projects } from '../data.js';
import {
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from './constants.js';

export function getProjectPath(slug) {
  return `${PORTFOLIO_PROJECTS_PATH}${slug}/`;
}

function normalizePortfolioPath(pathname) {
  return pathname !== PORTFOLIO_HOME_PATH && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
}

export function parsePortfolioRoute(pathname) {
  const normalizedPath = normalizePortfolioPath(pathname);
  const normalizedProjectsPath = normalizePortfolioPath(PORTFOLIO_PROJECTS_PATH);
  const normalizedContactPath = normalizePortfolioPath(PORTFOLIO_CONTACT_PATH);

  if (normalizedPath === PORTFOLIO_HOME_PATH) {
    return { key: 'about', type: 'about' };
  }

  if (normalizedPath === normalizedProjectsPath) {
    return { key: 'projects', type: 'projects' };
  }

  if (normalizedPath === normalizedContactPath) {
    return { key: 'contact', type: 'contact' };
  }

  const match = normalizedPath.match(/^\/projects\/([^/]+)$/);

  if (match) {
    const project = getProjectBySlug(match[1]);

    if (project) {
      return {
        key: `project:${project.slug}`,
        project,
        type: 'project',
      };
    }
  }

  return { key: 'missing', type: 'missing' };
}

export function isOverviewRoute(type) {
  return type === 'about' || type === 'projects';
}

export function getIndexableRoutes() {
  return [
    PORTFOLIO_HOME_PATH,
    PORTFOLIO_PROJECTS_PATH,
    PORTFOLIO_CONTACT_PATH,
    ...projects.map((project) => getProjectPath(project.slug)),
  ];
}
