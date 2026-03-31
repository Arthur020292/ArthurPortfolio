import { baseProjects } from './projectRecords.js';
import {
  browseProjectOrder,
  featuredProjectOrder,
  portfolioProjectColors,
} from './projectPresentation.js';
import { validateBaseProjects } from './projectValidation.js';

validateBaseProjects(baseProjects);

function toImageVariantPath(src, variant) {
  if (!src || /^https?:\/\//.test(src)) {
    return src;
  }

  const match = src.match(/^(.*)\.([a-zA-Z0-9]+)$/);

  if (!match) {
    return src;
  }

  const extension = match[2].toLowerCase();

  if (!['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    return src;
  }

  return `${match[1]}-${variant}.jpg`;
}

function createShortMeta(project) {
  return {
    details: [
      { label: 'Role', value: project.role },
      { label: 'Duration', value: project.duration },
      { label: 'Focus', value: project.focus },
    ].filter((item) => item.value && item.value !== 'N/A'),
    label: project.category,
    summary: project.overview,
  };
}

function createScreens(project) {
  const sourceScreens =
    project.gallery?.length > 0
      ? project.gallery
      : [{ alt: project.heroAlt, src: project.heroImage }];

  return sourceScreens.map((screen, index) => ({
    alt: screen.alt || `${project.name} screen ${index + 1}`,
    displaySrc: screen.displaySrc || toImageVariantPath(screen.src, 'display'),
    display: screen.display || 'screen',
    src: screen.src,
    thumbnailSrc: screen.thumbnailSrc || toImageVariantPath(screen.src, 'thumb'),
  }));
}

function createSeoTitle(project) {
  return (
    project.seoTitle ||
    `${project.name} ${project.category} Case Study | Product Designer Portfolio | Arthur Baduyen`
  );
}

function createSeoDescription(project) {
  return (
    project.seoDescription ||
    project.metaDescription ||
    `${project.name} case study by Arthur Baduyen covering ${project.category.toLowerCase()}, ${project.focus.toLowerCase()}, product design decisions, and frontend-ready delivery considerations.`
  );
}

function createSeoKeywords(project) {
  return Array.from(
    new Set(
      [
        project.name,
        project.category,
        project.focus,
        project.role,
        'Product Designer portfolio',
        'UI/UX designer portfolio',
        'product design case study',
        'AI-assisted workflow',
        'frontend-ready design',
      ]
        .filter(Boolean)
        .flatMap((entry) => String(entry).split(',').map((item) => item.trim()))
    )
  );
}

function createCaseStudySections(project) {
  const defaultSections = [
    {
      body: project.challenge,
      title: 'Challenge',
    },
    {
      body: project.approach,
      title: 'Approach',
    },
    {
      items: project.selectedWork,
      title: 'Selected Work',
    },
    {
      body: project.outcome,
      title: 'Outcome',
    },
  ];

  const sections = project.caseStudySections?.length ? [...project.caseStudySections] : defaultSections;
  const hasProblemSection = sections.some((section) => section.title === 'Problem');
  const hasResponsibilitiesSection = sections.some((section) => section.title === 'Responsibilities');

  const mergedSections = sections.map((section) => {
    if (section.title !== 'Impact' || !project.outcome) {
      return section;
    }

    return {
      ...section,
      body: section.body || project.outcome,
      title: 'Outcome & Impact',
    };
  });

  if (!hasProblemSection) {
    mergedSections.unshift({
      body: project.problem || project.challenge,
      title: 'Problem',
    });
  }

  if (project.responsibilities?.length && !hasResponsibilitiesSection) {
    const insertIndex = mergedSections[0]?.title === 'Problem' ? 1 : 0;

    mergedSections.splice(insertIndex, 0, {
      items: project.responsibilities,
      title: 'Responsibilities',
    });
  }

  return mergedSections;
}

function orderProjectsBySlugs(slugs, sourceProjects) {
  return slugs
    .map((slug) => sourceProjects.find((project) => project.slug === slug))
    .filter(Boolean);
}

export const projects = baseProjects.map((project, index) => ({
  ...project,
  accentColor: portfolioProjectColors[project.slug]?.color || '#ead8b2',
  caseStudySections: createCaseStudySections(project),
  caseStudyTools: project.caseStudyTools || [],
  order: index,
  seoDescription: createSeoDescription(project),
  seoKeywords: createSeoKeywords(project),
  seoTitle: createSeoTitle(project),
  socialImage: project.socialImage || project.cardImage || project.heroImage,
  screens: createScreens(project),
  shortMeta: createShortMeta(project),
}));

const projectMap = new Map(projects.map((project) => [project.slug, project]));

export function getProjectBySlug(slug) {
  return projectMap.get(slug) || null;
}

export function getFeaturedProjects() {
  return orderProjectsBySlugs(featuredProjectOrder, projects);
}

export function getBrowseProjects() {
  const prioritizedProjects = orderProjectsBySlugs(browseProjectOrder, projects);

  return [
    ...prioritizedProjects,
    ...projects.filter((project) => !browseProjectOrder.includes(project.slug)),
  ];
}
