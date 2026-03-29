import { useEffect, useState } from 'react';
import { getProjectBySlug } from '../../../data';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { BRAND_COLOR } from '../../../portfolio/constants';
import { getProjectPath } from '../../../portfolio/routes';
import { PortfolioNavLink } from '../PortfolioNavLink';
import { SectionLabel } from './SectionLabel';
import { flattenProjectRecommendations, pickNextRecommendation } from './projectRecommendation';

const ROTATION_INTERVAL_MS = 8000;
const recommendationEntries = flattenProjectRecommendations();

export function PortfolioProjectRecommendation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(
    recommendationEntries[0] || null
  );

  useEffect(() => {
    if (prefersReducedMotion || isPaused || recommendationEntries.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveRecommendation((currentEntry) =>
        pickNextRecommendation(recommendationEntries, currentEntry)
      );
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, prefersReducedMotion]);

  if (!activeRecommendation) {
    return null;
  }

  const project = getProjectBySlug(activeRecommendation.slug);

  if (!project) {
    return null;
  }

  return (
    <div
      className="portfolio-left-item mt-10 max-w-[30rem] rounded-[18px] border border-slate-200 bg-[#fbfaf7] px-6 py-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] max-[980px]:hidden"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3">
        <SectionLabel>Recommended next</SectionLabel>
        <span
          aria-hidden="true"
          data-testid="recommendation-progress-track"
          className="portfolio-recommendation-progress-track inline-flex h-0.5 w-8 overflow-hidden rounded-full bg-slate-200/80"
        >
          {!prefersReducedMotion ? (
            <span
              key={activeRecommendation.key}
              data-testid="recommendation-progress-fill"
              className="portfolio-recommendation-progress-fill h-full w-full rounded-full"
              style={{
                animationDuration: `${ROTATION_INTERVAL_MS}ms`,
                animationPlayState: isPaused ? 'paused' : 'running',
                backgroundColor: BRAND_COLOR,
              }}
            />
          ) : null}
        </span>
      </div>
      <div key={activeRecommendation.key} className="animate-content-enter mt-3">
        <p className="text-[1rem] leading-[1.75] text-slate-500">
          If you&apos;re looking for {activeRecommendation.reason}, start with{' '}
          <PortfolioNavLink
            className="font-semibold underline decoration-current underline-offset-4 transition-opacity hover:opacity-80"
            style={{ color: BRAND_COLOR }}
            to={getProjectPath(project.slug)}
          >
            {project.name}
          </PortfolioNavLink>
          .
        </p>
      </div>
    </div>
  );
}
