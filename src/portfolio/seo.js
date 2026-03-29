import {
  CONTACT_EMAIL,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE_PATH,
  LINKEDIN_URL,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
  SITE_NAME,
} from './constants.js';
import { getProjectPath } from './routes.js';

export function resolveSiteUrl(candidate, fallback = '') {
  const resolvedCandidate = String(candidate ?? '').trim().replace(/\/$/, '');

  if (resolvedCandidate) {
    return resolvedCandidate;
  }

  return String(fallback ?? '').trim().replace(/\/$/, '');
}

export function toAbsoluteUrl(path, siteUrl) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const resolvedSiteUrl = resolveSiteUrl(siteUrl);

  if (!resolvedSiteUrl) {
    return path;
  }

  return `${resolvedSiteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getPortfolioPageMeta(route) {
  if (route?.type === 'project' && route.project) {
    return {
      description: route.project.metaDescription,
      imagePath: route.project.cardImage || route.project.heroImage,
      path: getProjectPath(route.project.slug),
      title: route.project.metaTitle,
      type: 'article',
    };
  }

  if (route?.type === 'contact') {
    return {
      description:
        'Contact Arthur Baduyen about product design, UI/UX, design systems, and frontend-ready collaboration.',
      imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
      path: PORTFOLIO_CONTACT_PATH,
      title: 'Arthur Baduyen | Contact',
      type: 'website',
    };
  }

  if (route?.type === 'projects') {
    return {
      description:
        'Browse product design, UX, web, and internal tool case studies by Arthur Baduyen.',
      imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
      path: PORTFOLIO_PROJECTS_PATH,
      title: 'Arthur Baduyen | Projects',
      type: 'website',
    };
  }

  return {
    description: DEFAULT_META_DESCRIPTION,
    imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
    path: PORTFOLIO_HOME_PATH,
    title: 'Arthur Baduyen | Senior Product Designer',
    type: 'website',
  };
}

export function buildPortfolioStructuredData(meta, siteUrl) {
  const canonicalUrl = toAbsoluteUrl(meta.path, siteUrl);
  const imageUrl = toAbsoluteUrl(meta.imagePath, siteUrl);
  const resolvedSiteUrl = resolveSiteUrl(siteUrl);

  if (meta.type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      author: {
        '@type': 'Person',
        email: CONTACT_EMAIL,
        jobTitle: 'Senior Product Designer',
        name: SITE_NAME,
        sameAs: [LINKEDIN_URL],
      },
      description: meta.description,
      headline: meta.title,
      image: imageUrl ? [imageUrl] : undefined,
      name: meta.title,
      url: canonicalUrl || meta.path,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        email: CONTACT_EMAIL,
        jobTitle: 'Senior Product Designer',
        name: SITE_NAME,
        sameAs: [LINKEDIN_URL],
        url: resolvedSiteUrl || canonicalUrl || meta.path,
      },
      {
        '@type': 'WebSite',
        description: DEFAULT_META_DESCRIPTION,
        image: imageUrl || meta.imagePath,
        name: SITE_NAME,
        url: resolvedSiteUrl || canonicalUrl || meta.path,
      },
    ],
  };
}
