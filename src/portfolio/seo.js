import { projects } from '../data.js';
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

const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large';
const NOT_FOUND_ROBOTS = 'noindex,follow';

function buildProjectSeoTitle(project) {
  return (
    project.seoTitle ||
    `${project.name} ${project.category} Case Study | Product Designer Portfolio | Arthur Baduyen`
  );
}

function buildProjectSeoDescription(project) {
  return (
    project.seoDescription ||
    project.metaDescription ||
    `${project.name} case study by Arthur Baduyen covering ${project.category.toLowerCase()}, ${project.focus.toLowerCase()}, product design decisions, and frontend-ready delivery considerations.`
  );
}

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
      description: buildProjectSeoDescription(route.project),
      imagePath:
        route.project.socialImage ||
        route.project.cardImage ||
        route.project.heroImage,
      keywords: route.project.seoKeywords,
      ogType: 'article',
      path: getProjectPath(route.project.slug),
      project: route.project,
      robots: DEFAULT_ROBOTS,
      schemaType: 'CreativeWork',
      title: buildProjectSeoTitle(route.project),
      type: 'article',
    };
  }

  if (route?.type === 'contact') {
    return {
      description:
        'Contact Arthur Baduyen for product design, UI/UX design, frontend-ready collaboration, and AI-assisted product workflows.',
      imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
      ogType: 'website',
      pageType: 'ContactPage',
      path: PORTFOLIO_CONTACT_PATH,
      robots: DEFAULT_ROBOTS,
      title: 'Contact Arthur Baduyen | Product Designer',
      type: 'website',
    };
  }

  if (route?.type === 'projects') {
    return {
      description:
        'Browse product design and UI/UX case studies by Arthur Baduyen across healthcare, internal tools, design systems, and frontend-ready delivery.',
      imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
      itemList: projects.map((project) => ({
        description: buildProjectSeoDescription(project),
        image: project.socialImage || project.cardImage || project.heroImage,
        name: project.seoTitle || buildProjectSeoTitle(project),
        slug: project.slug,
      })),
      ogType: 'website',
      path: PORTFOLIO_PROJECTS_PATH,
      robots: DEFAULT_ROBOTS,
      schemaType: 'CollectionPage',
      title: 'Product Design Case Studies | Arthur Baduyen',
      type: 'website',
    };
  }

  if (route?.type === 'missing') {
    return {
      description:
        'The page you requested could not be found. Browse Arthur Baduyen’s UI/UX designer portfolio and case studies instead.',
      imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
      ogType: 'website',
      pageType: 'WebPage',
      path: '/404/',
      robots: NOT_FOUND_ROBOTS,
      title: 'Page Not Found | Arthur Baduyen',
      type: 'website',
    };
  }

  return {
    description: DEFAULT_META_DESCRIPTION,
    imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
    ogType: 'website',
    pageType: 'ProfilePage',
    path: PORTFOLIO_HOME_PATH,
    robots: DEFAULT_ROBOTS,
    title: 'Arthur Baduyen | Product Designer Portfolio',
    type: 'website',
  };
}

export function buildPortfolioStructuredData(meta, siteUrl) {
  const canonicalUrl = toAbsoluteUrl(meta.path, siteUrl);
  const imageUrl = toAbsoluteUrl(meta.imagePath, siteUrl);
  const resolvedSiteUrl = resolveSiteUrl(siteUrl);
  const websiteUrl = resolvedSiteUrl || canonicalUrl || meta.path;
  const personNode = {
    '@id': `${websiteUrl}#person`,
    '@type': 'Person',
    email: CONTACT_EMAIL,
    jobTitle: 'Product Designer',
    name: SITE_NAME,
    sameAs: [LINKEDIN_URL],
    url: resolvedSiteUrl || canonicalUrl || meta.path,
  };
  const websiteNode = {
    '@id': `${websiteUrl}#website`,
    '@type': 'WebSite',
    description: DEFAULT_META_DESCRIPTION,
    image: imageUrl || meta.imagePath,
    name: SITE_NAME,
    url: resolvedSiteUrl || canonicalUrl || meta.path,
  };

  if (meta.schemaType === 'CreativeWork') {
    const project = meta.project;

    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      about: [project?.category, project?.focus].filter(Boolean),
      author: {
        '@id': personNode['@id'],
        '@type': 'Person',
        name: SITE_NAME,
      },
      description: meta.description,
      headline: `${project?.name || meta.title} case study`,
      image: imageUrl ? [imageUrl] : undefined,
      isPartOf: {
        '@id': websiteNode['@id'],
      },
      keywords: meta.keywords,
      mainEntityOfPage: canonicalUrl || meta.path,
      name: `${project?.name || meta.title} case study`,
      url: canonicalUrl || meta.path,
    };
  }

  if (meta.schemaType === 'CollectionPage') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        personNode,
        websiteNode,
        {
          '@id': `${canonicalUrl}#collection`,
          '@type': 'CollectionPage',
          description: meta.description,
          image: imageUrl || meta.imagePath,
          isPartOf: {
            '@id': websiteNode['@id'],
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: (meta.itemList || []).map((item, index) => ({
              '@type': 'ListItem',
              name: item.name,
              position: index + 1,
              url: toAbsoluteUrl(getProjectPath(item.slug), siteUrl),
            })),
          },
          name: meta.title,
          url: canonicalUrl || meta.path,
        },
      ],
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode,
      websiteNode,
      {
        '@type': meta.pageType || 'WebPage',
        about: {
          '@id': personNode['@id'],
        },
        description: meta.description,
        image: imageUrl || meta.imagePath,
        isPartOf: {
          '@id': websiteNode['@id'],
        },
        name: meta.title,
        url: canonicalUrl || meta.path,
      },
    ],
  };
}
