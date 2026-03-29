export const projectRecommendationGroups = [
  {
    reasons: [
      'multi-role platform work',
      'healthcare product design',
      'separate internal and external surfaces',
      'AI-guided care workflows',
    ],
    slug: 'zip',
  },
  {
    reasons: [
      'internal operations workflows',
      'payroll and reimbursement systems',
      'employee admin tooling',
      'time logging and reporting',
    ],
    slug: 'chronomedia',
  },
  {
    reasons: [
      'family financial education',
      'kid and parent workflows',
      'playful learning with structure',
      'kids-facing interface design',
    ],
    slug: 'kidough',
  },
  {
    reasons: [
      'real estate decision workflows',
      'property analysis and reporting',
      'multi-role user journeys',
      'scalable design systems',
    ],
    slug: 'nester',
  },
  {
    reasons: [
      'lean process improvement tools',
      'work-observation flows',
      'dense operational data',
      'training and legacy materials',
    ],
    slug: 'workrite',
  },
  {
    reasons: ['mission support and donation flows', 'multi-role community platforms'],
    slug: 'harvest21',
  },
  {
    reasons: ['service operations workflows', 'order and invoice management'],
    slug: 'portlandpedalpower',
  },
  {
    reasons: ['talent operations platforms', 'secure client sharing'],
    slug: 'chromedia-talent-intelligence',
  },
  {
    reasons: ['large-scale asset management', 'admin navigation cleanup'],
    slug: 'msp',
  },
  {
    reasons: ['long-term design system consistency', 'healthcare admin platform work'],
    slug: 'spokehealth',
  },
  {
    reasons: ['agency service storytelling'],
    slug: 'chromedia',
  },
  {
    reasons: ['healthcare website trust and conversion'],
    slug: 'mrioa',
  },
  {
    reasons: ['B2B messaging for complex services'],
    slug: 'contractsrx',
  },
  {
    reasons: ['mobile warehouse workflows'],
    slug: 'nlrp',
  },
];

export function flattenProjectRecommendations(groups = projectRecommendationGroups) {
  return groups.flatMap(({ reasons, slug }) =>
    reasons.map((reason, reasonIndex) => ({
      key: `${slug}-${reasonIndex}`,
      reason,
      slug,
    }))
  );
}

export function pickNextRecommendation(entries, currentEntry, random = Math.random) {
  if (!entries.length) {
    return null;
  }

  const eligibleEntries = currentEntry
    ? entries.filter((entry) => entry.slug !== currentEntry.slug)
    : entries;

  const pool = eligibleEntries.length ? eligibleEntries : entries;
  const randomIndex = Math.floor(Math.min(Math.max(random(), 0), 0.9999999999) * pool.length);

  return pool[randomIndex] || pool[0] || null;
}
