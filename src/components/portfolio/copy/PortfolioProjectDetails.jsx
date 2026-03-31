import { getBrowseProjects } from '../../../data';
import {
  BRAND_COLOR,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from '../../../portfolio/constants';
import { getProjectPath } from '../../../portfolio/routes';
import { PortfolioNavLink } from '../PortfolioNavLink';
import { CaseStudySection } from './CaseStudySection';
import { SectionLabel } from './SectionLabel';

function renderSummaryWithLink(summary, linkText, href) {
  if (!href || !linkText || !summary) {
    return summary;
  }

  const index = summary.indexOf(linkText);

  if (index === -1) {
    return summary;
  }

  const before = summary.slice(0, index);
  const after = summary.slice(index + linkText.length);

  return (
    <>
      {before}
      <a
        href={href}
        rel="noreferrer"
        target="_blank"
        className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 hover:decoration-slate-500"
      >
        {linkText}
      </a>
      {after}
    </>
  );
}

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

function getRelatedProjects(project) {
  return getBrowseProjects()
    .filter((entry) => entry.slug !== project.slug)
    .slice(0, 3);
}

function getProjectHighlights(project) {
  return [
    project.productThinking
      ? { label: 'Product Thinking', value: project.productThinking }
      : null,
    project.builderSignal ? { label: 'Build Lens', value: project.builderSignal } : null,
    project.outcomeSignal ? { label: 'Outcome', value: project.outcomeSignal } : null,
    project.aiWorkflow ? { label: 'AI Workflow', value: project.aiWorkflow } : null,
  ].filter(Boolean);
}

export function PortfolioProjectRouteNav({
  className = '',
  project,
}) {
  const { nextProject } = getAdjacentProjects(project);

  return (
    <nav
      aria-label="Next project"
      className={`flex items-start justify-between gap-5 max-[980px]:flex-col max-[980px]:items-start max-[980px]:gap-7 ${className}`}
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
  const relatedProjects = getRelatedProjects(project);
  const projectHighlights = getProjectHighlights(project);

  return (
    <div className="flex min-h-full flex-col max-[980px]:min-h-0">
      <div className="flex-1 max-[980px]:flex-none">
        <nav
          aria-label="Breadcrumb"
          className="portfolio-left-item flex flex-wrap items-center gap-2 text-[0.8rem] text-slate-500"
        >
          <PortfolioNavLink className="transition-colors hover:text-slate-900" to={PORTFOLIO_HOME_PATH}>
            Home
          </PortfolioNavLink>
          <span aria-hidden="true">/</span>
          <PortfolioNavLink className="transition-colors hover:text-slate-900" to={PORTFOLIO_PROJECTS_PATH}>
            Case Studies
          </PortfolioNavLink>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900">{project.name}</span>
        </nav>

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
            {renderSummaryWithLink(project.shortMeta.summary, project.name, project.websiteUrl)}
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

        {projectHighlights.length ? (
          <div className="portfolio-left-item mt-8 max-[640px]:mt-6">
            <SectionLabel>Project Highlights</SectionLabel>
            <div className="mt-4 grid gap-3">
              {projectHighlights.map((item) => (
                <div
                  className="rounded-[16px] border border-slate-200 bg-[#fbfaf7] px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]"
                  key={item.label}
                >
                  <h2 className="text-[0.72rem] font-bold tracking-[0.16em] text-slate-400 uppercase">
                    {item.label}
                  </h2>
                  <p className="mt-2 text-[0.98rem] leading-[1.75] text-slate-700">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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

        {relatedProjects.length ? (
          <div className="portfolio-left-item mt-10 max-[640px]:mt-8">
            <SectionLabel>Related Case Studies</SectionLabel>
            <div className="mt-4 grid gap-3">
              {relatedProjects.map((entry) => (
                <PortfolioNavLink
                  className="inline-flex flex-col rounded-[16px] border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-left no-underline transition-colors hover:border-slate-300"
                  key={entry.slug}
                  to={getProjectPath(entry.slug)}
                >
                  <span className="text-[0.72rem] font-bold tracking-[0.16em] text-slate-400 uppercase">
                    {entry.category}
                  </span>
                  <span className="mt-1 text-[1rem] font-semibold text-slate-900">
                    {entry.name}
                  </span>
                </PortfolioNavLink>
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

      <div className="portfolio-left-item mt-10 border-t border-slate-200/80 bg-[rgba(250,250,250,0.98)] px-12 py-6 shadow-[0_-14px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm max-[980px]:mt-12 max-[980px]:min-h-[13rem] max-[980px]:bg-[rgba(250,250,250,0.96)] max-[980px]:px-0 max-[980px]:py-12 max-[980px]:shadow-[0_-10px_20px_rgba(15,23,42,0.05)] max-[640px]:hidden">
        <PortfolioProjectRouteNav project={project} />
      </div>
    </div>
  );
}
