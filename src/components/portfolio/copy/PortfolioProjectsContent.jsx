import { PortfolioProjectRecommendation } from './PortfolioProjectRecommendation';

export function PortfolioProjectsContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          UI/UX design case studies.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500">
          Browse portfolio work across healthcare, internal tools, design systems, responsive
          websites, and product workflows. Each case study is written for both recruiters and
          teams evaluating how I approach UX strategy, interface design, and frontend-ready
          delivery.
        </p>
      </div>

      <PortfolioProjectRecommendation />
    </div>
  );
}
