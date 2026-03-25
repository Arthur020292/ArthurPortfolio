import { baseProjects } from './projectRecords';
import {
  browseProjectOrder,
  featuredProjectOrder,
  portfolioProjectColors,
} from './projectPresentation';

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
    src: screen.src,
  }));
}

function createCaseStudySections(project) {
  if (project.caseStudySections?.length) {
    return project.caseStudySections;
  }

  return [
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
