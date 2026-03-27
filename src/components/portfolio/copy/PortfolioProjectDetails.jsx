import { getBrowseProjects } from '../../../data';
import {
  BRAND_COLOR,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from '../../../portfolio/constants';
import { getProjectPath } from '../../../portfolio/routes';
import { PortfolioNavLink } from '../PortfolioNavLink';
import { CaseStudySection } from './CaseStudySection';
import { SectionLabel } from './SectionLabel';

function getAdjacentProjects(project) {
  const orderedProjects = getBrowseProjects();
  const currentIndex = orderedProjects.findIndex((entry) => entry.slug === project.slug);

  if (currentIndex === -1) {
    return {
      nextProject: orderedProjects[0] ?? project,
    };
  }

  return {
    nextProject:
      currentIndex < orderedProjects.length - 1
        ? orderedProjects[currentIndex + 1]
        : orderedProjects[0],
  };
}

export function PortfolioProjectRouteNav({
  className = '',
  project,
}) {
  const { nextProject } = getAdjacentProjects(project);

  return (
    <nav
      aria-label="Next project"
      className={`flex items-start justify-between gap-5 max-[980px]:flex-col max-[980px]:items-start ${className}`}
    >
      <PortfolioNavLink
        className="inline-flex items-center font-medium text-slate-500 transition-colors hover:text-slate-900 max-[980px]:hidden"
        to={PORTFOLIO_PROJECTS_PATH}
      >
        All Projects
      </PortfolioNavLink>
      <PortfolioNavLink
        className="group ml-auto flex flex-col items-start text-left max-[980px]:ml-0 max-[980px]:items-start"
        to={getProjectPath(nextProject.slug)}
      >
        <span className="inline-flex items-center gap-2 text-[0.74rem] font-bold tracking-[0.16em] text-slate-400 uppercase transition-colors group-hover:text-slate-500">
          Next Project
          <span aria-hidden="true">→</span>
        </span>
        <span className="mt-1 text-[1.02rem] font-semibold leading-[1.35] text-slate-900 transition-colors group-hover:text-slate-700 sm:mt-2 sm:text-[1.08rem]">
          {nextProject.name}
        </span>
      </PortfolioNavLink>
    </nav>
  );
}

export function PortfolioProjectDetails({ project }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        <div className="portfolio-left-item">
          <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            {project.shortMeta.label}
          </p>
          <h1 className="mt-4 font-heading text-[clamp(2.6rem,5vw,4.7rem)] leading-[0.95] font-bold tracking-[-0.055em] text-slate-900 max-[640px]:text-[clamp(2.2rem,12vw,3.2rem)]">
            {project.name}
          </h1>
        </div>

        <div className="portfolio-left-item mt-8 max-w-[28rem] max-[640px]:mt-6">
          <p className="text-[1.08rem] leading-[1.85] text-slate-500 max-[640px]:text-[1rem] max-[640px]:leading-[1.72]">
            {project.shortMeta.summary}
          </p>
        </div>

        <dl className="portfolio-left-item mt-8 grid gap-5 text-sm text-slate-500 max-[640px]:mt-6 max-[640px]:gap-4">
          {project.shortMeta.details.map((item) => (
            <div key={item.label}>
              <dt className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 text-[0.98rem] leading-[1.6] text-slate-800">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {project.caseStudySections?.length ? (
          <div className="portfolio-left-item mt-10 grid gap-4 max-[640px]:mt-8 max-[640px]:gap-3">
            {project.caseStudySections.map((section) => (
              <CaseStudySection key={section.title} section={section} />
            ))}
          </div>
        ) : null}

        {project.caseStudyTools?.length ? (
          <div className="portfolio-left-item mt-10 max-[640px]:mt-8">
            <SectionLabel>Tools & Technologies</SectionLabel>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {project.caseStudyTools.map((tool) => (
                <span
                  className="rounded-full border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[0.82rem] font-medium text-slate-700"
                  key={tool}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="portfolio-left-item mt-10 rounded-[18px] border border-slate-200 bg-[#fbfaf7] px-6 py-6 max-[640px]:hidden">
          <h2 className="font-heading text-[1.55rem] leading-[1.05] font-semibold tracking-[-0.04em] text-slate-900 max-[640px]:text-[1.35rem]">
            Need this kind of work?
          </h2>
          <div className="mt-4">
            <PortfolioNavLink
              className="inline-flex items-center text-[0.98rem] font-semibold no-underline transition-opacity hover:opacity-80"
              style={{ color: BRAND_COLOR }}
              to={PORTFOLIO_CONTACT_PATH}
            >
              Get in touch
            </PortfolioNavLink>
          </div>
        </div>
      </div>

      <div className="portfolio-left-item mt-10 border-t border-slate-200/80 bg-[rgba(250,250,250,0.98)] px-12 py-6 shadow-[0_-14px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm max-[980px]:mt-8 max-[980px]:bg-[rgba(250,250,250,0.96)] max-[980px]:px-0 max-[980px]:py-7 max-[980px]:shadow-[0_-10px_20px_rgba(15,23,42,0.05)] max-[640px]:hidden">
        <PortfolioProjectRouteNav project={project} />
      </div>
    </div>
  );
}
