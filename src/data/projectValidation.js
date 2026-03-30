function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

function formatProjectLabel(project, index) {
  return project?.slug ? `project "${project.slug}"` : `project[${index}]`;
}

function assertString(value, fieldName, projectLabel) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing ${fieldName} for ${projectLabel}.`);
  }
}

function assertArray(value, fieldName, projectLabel) {
  if (!Array.isArray(value) || !value.length) {
    throw new Error(`Missing ${fieldName} entries for ${projectLabel}.`);
  }
}

function validateGallery(project, projectLabel) {
  assertArray(project.gallery, 'gallery', projectLabel);

  project.gallery.forEach((screen, index) => {
    const screenLabel = `${projectLabel} gallery item ${index + 1}`;

    if (!screen || typeof screen !== 'object') {
      throw new Error(`Missing screen data for ${screenLabel}.`);
    }

    assertString(screen.src, 'screen src', screenLabel);
    assertString(screen.alt, 'screen alt', screenLabel);

    if (screen.display && !['screen', 'longform'].includes(screen.display)) {
      throw new Error(`Invalid screen display for ${screenLabel}.`);
    }
  });
}

function validateCaseStudySections(project, projectLabel) {
  if (!Array.isArray(project.caseStudySections) || !project.caseStudySections.length) {
    return;
  }

  const seenTitles = new Set();
  const normalizedOutcome = normalizeText(project.outcome);

  project.caseStudySections.forEach((section, index) => {
    const sectionLabel = `${projectLabel} case-study section ${index + 1}`;

    if (!section || typeof section !== 'object') {
      throw new Error(`Missing section data for ${sectionLabel}.`);
    }

    assertString(section.title, 'section title', sectionLabel);

    const normalizedTitle = normalizeText(section.title);

    if (seenTitles.has(normalizedTitle)) {
      throw new Error(`Duplicate case-study section title "${section.title}" for ${projectLabel}.`);
    }

    seenTitles.add(normalizedTitle);

    const hasBody = typeof section.body === 'string' && section.body.trim();
    const hasItems = Array.isArray(section.items) && section.items.length > 0;

    if (!hasBody && !hasItems) {
      throw new Error(`Section "${section.title}" for ${projectLabel} needs body or items.`);
    }

    if (hasItems) {
      section.items.forEach((item, itemIndex) => {
        if (typeof item !== 'string' || !item.trim()) {
          throw new Error(
            `Section "${section.title}" for ${projectLabel} has an invalid item at position ${
              itemIndex + 1
            }.`
          );
        }
      });
    }

    if (normalizedTitle === 'impact' && normalizedOutcome) {
      const duplicateText = hasBody
        ? normalizeText(section.body) === normalizedOutcome
        : section.items.some((item) => normalizeText(item) === normalizedOutcome);

      if (duplicateText) {
        throw new Error(`Impact content for ${projectLabel} repeats the outcome text.`);
      }
    }
  });
}

function validateWebsiteUrl(project, projectLabel) {
  if (!project.websiteUrl) {
    return;
  }

  try {
    const url = new URL(project.websiteUrl);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    throw new Error(`Invalid websiteUrl for ${projectLabel}.`);
  }
}

function validateProject(project, index) {
  const projectLabel = formatProjectLabel(project, index);

  if (!project || typeof project !== 'object') {
    throw new Error(`Missing project at index ${index}.`);
  }

  [
    'slug',
    'name',
    'category',
    'metaTitle',
    'metaDescription',
    'cardImage',
    'cardAlt',
    'cardSummary',
    'overview',
    'problem',
    'challenge',
    'approach',
    'outcome',
    'heroImage',
    'heroAlt',
    'role',
    'duration',
    'focus',
  ].forEach((field) => {
    assertString(project[field], field, projectLabel);
  });

  assertArray(project.gallery, 'gallery', projectLabel);
  assertArray(project.selectedWork, 'selectedWork', projectLabel);
  assertArray(project.responsibilities, 'responsibilities', projectLabel);

  validateGallery(project, projectLabel);
  validateCaseStudySections(project, projectLabel);
  validateWebsiteUrl(project, projectLabel);
}

export function validateBaseProjects(projects) {
  if (!Array.isArray(projects)) {
    throw new Error('Project catalog must be an array.');
  }

  const seenSlugs = new Set();

  projects.forEach((project, index) => {
    validateProject(project, index);

    if (seenSlugs.has(project.slug)) {
      throw new Error(`Duplicate project slug "${project.slug}".`);
    }

    seenSlugs.add(project.slug);
  });

  return projects;
}
