import { PortfolioProjectRecommendation } from './PortfolioProjectRecommendation';

export function PortfolioProjectsContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          Product design case studies.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500">
          Browse product design and UI/UX case studies across healthcare, internal tools, design
          systems, and service platforms. These write-ups show how I approach product strategy,
          frontend-ready execution, and implementation constraints so recruiters, founders, and
          teams can see how I work.
        </p>
      </div>

      <PortfolioProjectRecommendation />
    </div>
  );
}
