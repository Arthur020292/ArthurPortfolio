import { useEffect, useState } from 'react';
import { getBrowseProjects, getFeaturedProjects } from '../../data';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import {
  PROJECTS_SEQUENCE_ENTER_MS,
  BRAND_COLOR,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from '../../portfolio/constants';
import { PortfolioNavLink } from './PortfolioNavLink';
import { getProjectPath } from '../../portfolio/routes';
import { useLocation } from '../../router-dom';

function ProjectTile({
  animationDelay,
  className,
  project,
  to,
}) {
  return (
    <PortfolioNavLink
      className={className}
      style={animationDelay != null ? { animationDelay: `${animationDelay}ms` } : undefined}
      to={to}
    >
      <span
        aria-hidden="true"
        className="portfolio-project-overlay absolute inset-0"
      />

      <div className="relative z-10">
        <h2 className="portfolio-project-title max-w-[11ch] font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900 max-[720px]:max-w-[9ch] max-[720px]:text-[clamp(1.8rem,10vw,2.3rem)]">
          {project.name}
        </h2>
      </div>

      <div className="relative z-10 mt-8 max-[720px]:mt-6">
        <p className="portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase max-[720px]:text-[0.72rem]">
          {project.category}
        </p>
        <div className="portfolio-project-bar mt-4 h-1.5 w-12 rounded-full bg-slate-200 max-[720px]:mt-3">
          <div
            className="portfolio-project-bar-fill h-full origin-left rounded-full"
            style={{ backgroundColor: project.accentColor }}
          />
        </div>
      </div>
    </PortfolioNavLink>
  );
}

function ContactTile({
  animationDelay,
  className,
}) {
  return (
    <PortfolioNavLink
      className={className}
      style={animationDelay != null ? { animationDelay: `${animationDelay}ms` } : undefined}
      to={PORTFOLIO_CONTACT_PATH}
    >
      <span
        aria-hidden="true"
        className="portfolio-project-overlay absolute inset-0"
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h2 className="portfolio-project-title max-w-[11ch] font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900 max-[720px]:max-w-[9ch] max-[720px]:text-[clamp(1.8rem,10vw,2.3rem)]">
            Tell me about your project.
          </h2>
        </div>

        <div className="relative z-10 mt-8 max-[720px]:mt-6">
          <p className="portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase max-[720px]:text-[0.72rem]">
            Start a conversation
          </p>
          <div className="portfolio-project-bar mt-6 h-1.5 w-12 rounded-full bg-slate-200">
            <div
              className="portfolio-project-bar-fill h-full origin-left rounded-full"
              style={{ backgroundColor: BRAND_COLOR }}
            />
          </div>
        </div>
      </div>
    </PortfolioNavLink>
  );
}

export function PortfolioProjectGrid({
  contactExitState,
  mode = 'all',
  overviewGridMotion,
}) {
  const location = useLocation();
  const isProjectsRoute =
    location.pathname.replace(/\/$/, '') === PORTFOLIO_PROJECTS_PATH.replace(/\/$/, '');
  const isMobileViewport = useIsMobileViewport();
  const featuredCount = getFeaturedProjects().length;
  const browseProjects = getBrowseProjects();
  const [projectsSequenceStage, setProjectsSequenceStage] = useState('idle');
  const [projectsSequenceToken, setProjectsSequenceToken] = useState(null);
  const [projectsSequenceCompressing, setProjectsSequenceCompressing] = useState(
    mode === 'all' && isProjectsRoute && !overviewGridMotion?.token
  );
  const [featuredGridSettling, setFeaturedGridSettling] = useState(false);
  const orderedProjects = mode === 'featured' ? getFeaturedProjects() : browseProjects;
  const remainingDesktopSlots = (3 - (orderedProjects.length % 3)) % 3;
  const isWideContactTile = remainingDesktopSlots === 2;
  const sharedMoreProjects = !isMobileViewport ? browseProjects.slice(featuredCount, featuredCount + 3) : [];
  const contactTileLayoutClass =
    mode === 'featured' && isMobileViewport
      ? 'col-span-3 max-[980px]:col-span-2 max-[720px]:col-span-1'
      : isWideContactTile
        ? 'portfolio-contact-tile-span-2'
        : '';
  const isContactExit = contactExitState;
  const gridMotionClass =
    mode === 'all'
      ? `${projectsSequenceStage === 'enter' ? 'portfolio-grid-projects-enter' : ''} ${
          projectsSequenceCompressing ? 'portfolio-grid-projects-compress' : ''
        }`.trim()
      : overviewGridMotion?.to === 'about' && featuredGridSettling
        ? 'portfolio-grid-overview-collapse'
        : '';
  const leadProjects = mode === 'all' ? orderedProjects.slice(0, featuredCount) : orderedProjects;
  const trailingProjects = mode === 'all' ? browseProjects.slice(featuredCount + 3) : [];
  const showContactTile = mode === 'all' && !isMobileViewport && remainingDesktopSlots > 0;
  const exitTileCount =
    leadProjects.length + sharedMoreProjects.length + trailingProjects.length + (showContactTile ? 1 : 0);

  useEffect(() => {
    if (location.hash !== '#projects') {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById('portfolio-projects-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [location.hash]);

  useEffect(() => {
    if (mode !== 'all') {
      setProjectsSequenceToken(null);
      setProjectsSequenceStage('idle');
      setProjectsSequenceCompressing(false);
      return undefined;
    }

    if (overviewGridMotion?.to !== 'projects' || !overviewGridMotion?.token) {
      return undefined;
    }

    setProjectsSequenceToken(overviewGridMotion.token);
    setProjectsSequenceStage('enter');
  }, [mode, overviewGridMotion?.to, overviewGridMotion?.token]);

  useEffect(() => {
    if (mode !== 'all' || projectsSequenceStage !== 'enter') {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProjectsSequenceStage('idle');
      return undefined;
    }

    const settleTimer = window.setTimeout(() => {
      setProjectsSequenceStage('idle');
    }, PROJECTS_SEQUENCE_ENTER_MS);

    return () => {
      window.clearTimeout(settleTimer);
    };
  }, [mode, projectsSequenceStage, projectsSequenceToken]);

  useEffect(() => {
    if (mode !== 'all' || !projectsSequenceToken) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProjectsSequenceCompressing(false);
      return undefined;
    }

    const compressTimer = window.setTimeout(() => {
      setProjectsSequenceCompressing(true);
    }, 120);

    return () => {
      window.clearTimeout(compressTimer);
    };
  }, [mode, projectsSequenceToken]);

  useEffect(() => {
    if (mode !== 'featured' || overviewGridMotion?.to !== 'about' || !overviewGridMotion?.token) {
      setFeaturedGridSettling(false);
      return undefined;
    }

    setFeaturedGridSettling(true);

    const settleTimer = window.setTimeout(() => {
      setFeaturedGridSettling(false);
    }, 120);

    return () => {
      window.clearTimeout(settleTimer);
    };
  }, [mode, overviewGridMotion?.to, overviewGridMotion?.token]);

  return (
    <div
      className="portfolio-right-panel flex h-full min-h-full flex-col border-l border-slate-200 bg-[#fbfaf7] max-[980px]:min-h-[55vh] max-[980px]:border-l-0"
      id="portfolio-projects-section"
    >
      <div
        className={`relative grid flex-1 grid-cols-3 border-r border-b border-slate-200 bg-[#fbfaf7] max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 ${gridMotionClass} ${isContactExit ? 'portfolio-grid-contact-exit' : ''}`}
        key={overviewGridMotion?.token || mode}
      >
        {leadProjects.map((project, index) => (
          <ProjectTile
            animationDelay={isContactExit ? (exitTileCount - 1 - index) * 30 : null}
            className={`portfolio-project-tile portfolio-project-tile-shared group flex min-h-[15.5rem] flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline max-[980px]:min-h-[12.5rem] max-[980px]:p-5 max-[720px]:min-h-[9rem] max-[720px]:p-4`}
            key={project.slug}
            project={project}
            to={getProjectPath(project.slug)}
          />
        ))}

        {sharedMoreProjects.map((project, index) => (
          <ProjectTile
            animationDelay={isContactExit ? (exitTileCount - 1 - (leadProjects.length + index)) * 30 : null}
            className="portfolio-project-tile portfolio-project-tile-shared group flex min-h-[15.5rem] flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline max-[980px]:min-h-[12.5rem] max-[980px]:p-5 max-[720px]:min-h-[9rem] max-[720px]:p-4"
            key={project.slug}
            project={project}
            to={getProjectPath(project.slug)}
          />
        ))}

        {trailingProjects.map((project, index) => (
          <ProjectTile
            animationDelay={
              isContactExit
                ? (exitTileCount - 1 - (leadProjects.length + index)) * 30
                : overviewGridMotion?.to === 'projects'
                  ? 20 + index * 60
                  : null
            }
            className="portfolio-project-tile portfolio-project-tile-new group flex min-h-[15.5rem] flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline max-[980px]:min-h-[12.5rem] max-[980px]:p-5 max-[720px]:min-h-[9rem] max-[720px]:p-4"
            key={project.slug}
            project={project}
            to={getProjectPath(project.slug)}
          />
        ))}

        {showContactTile ? (
            mode === 'featured' ? (
            <PortfolioNavLink
              className={`portfolio-project-tile portfolio-contact-tile group flex min-h-[15.5rem] flex-col justify-between bg-[#f3f0ea] p-8 text-inherit no-underline max-[980px]:min-h-[12.5rem] max-[980px]:p-5 max-[720px]:min-h-[14.25rem] max-[720px]:px-6 max-[720px]:py-20 ${
                mode === 'all' ? 'portfolio-project-tile-new' : ''
              } ${mode === 'featured' ? 'portfolio-featured-cta-row' : ''} ${contactTileLayoutClass}`}
              style={
                isContactExit
                  ? {
                      animationDelay: `${
                        (exitTileCount - 1 - (leadProjects.length + trailingProjects.length)) * 30
                      }ms`,
                    }
                  : undefined
              }
              to={PORTFOLIO_CONTACT_PATH}
            >
              <span
                aria-hidden="true"
                className="portfolio-project-overlay absolute inset-0"
              />

              <>
                <div className="relative z-10">
                  <h2
                    className={`portfolio-project-title font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900 max-[720px]:text-[clamp(1.85rem,10vw,2.25rem)] ${
                      isWideContactTile ? 'max-w-[18ch]' : 'max-w-[12ch]'
                    }`}
                  >
                    Tell me about your project.
                  </h2>
                </div>

                <div className="relative z-10 mt-8 max-[720px]:mt-6">
                  <p
                    className={`portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase max-[720px]:text-[0.72rem] ${
                      isWideContactTile ? 'max-w-none' : ''
                    }`}
                  >
                    Start a conversation
                  </p>
                  <div className="portfolio-project-bar mt-6 h-1.5 w-12 rounded-full bg-slate-200">
                    <div
                      className="portfolio-project-bar-fill h-full origin-left rounded-full"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                  </div>
                </div>
              </>
            </PortfolioNavLink>
          ) : (
            <ContactTile
              animationDelay={
                isContactExit
                  ? (exitTileCount - 1 - (leadProjects.length + trailingProjects.length)) * 30
                  : mode === 'all' && overviewGridMotion?.to === 'projects'
                    ? 80 + trailingProjects.length * 70
                    : undefined
              }
              className={`portfolio-project-tile portfolio-contact-tile group flex min-h-[15.5rem] flex-col justify-between bg-[#f3f0ea] p-8 text-inherit no-underline max-[980px]:min-h-[12.5rem] max-[980px]:p-5 max-[720px]:min-h-[14.25rem] max-[720px]:px-6 max-[720px]:py-20 ${contactTileLayoutClass}`}
            />
          )
        ) : null}
      </div>
    </div>
  );
}
