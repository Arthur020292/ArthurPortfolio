import { PORTFOLIO_CONTACT_PATH, PORTFOLIO_HOME_PATH, PORTFOLIO_PROJECTS_PATH } from '../../../portfolio/constants';
import { PortfolioNavLink } from '../PortfolioNavLink';

export function PortfolioNotFoundContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          404
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500">
          The page you requested could not be found. You can head back to the portfolio homepage,
          browse the case studies, or open the contact page instead.
        </p>
      </div>

      <nav aria-label="404 recovery" className="portfolio-left-item mt-8 flex flex-wrap gap-3">
        <PortfolioNavLink
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-[0.92rem] font-semibold text-slate-900 no-underline transition-colors hover:bg-slate-100"
          to={PORTFOLIO_HOME_PATH}
        >
          Back to home
        </PortfolioNavLink>
        <PortfolioNavLink
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-[0.92rem] font-semibold text-slate-900 no-underline transition-colors hover:bg-slate-100"
          to={PORTFOLIO_PROJECTS_PATH}
        >
          Browse case studies
        </PortfolioNavLink>
        <PortfolioNavLink
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-[0.92rem] font-semibold text-slate-900 no-underline transition-colors hover:bg-slate-100"
          to={PORTFOLIO_CONTACT_PATH}
        >
          Contact Arthur
        </PortfolioNavLink>
      </nav>
    </div>
  );
}
