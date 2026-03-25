import { getProjectBySlug } from '../data';
import {
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from './constants';

export function getProjectPath(slug) {
  return `${PORTFOLIO_PROJECTS_PATH}/${slug}`;
}

export function parsePortfolioRoute(pathname) {
  const normalizedPath =
    pathname !== PORTFOLIO_HOME_PATH && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (normalizedPath === PORTFOLIO_HOME_PATH) {
    return { key: 'about', type: 'about' };
  }

  if (normalizedPath === PORTFOLIO_PROJECTS_PATH) {
    return { key: 'projects', type: 'projects' };
  }

  if (normalizedPath === PORTFOLIO_CONTACT_PATH) {
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
