import { PortfolioProjectRecommendation } from './PortfolioProjectRecommendation';

export function PortfolioProjectsContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          The work, behind the work.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500 max-[980px]:hidden">
          Browse product, UX, web, and internal-tool work. Start anywhere, then open a case
          study for the full story.
        </p>
      </div>

      <PortfolioProjectRecommendation />
    </div>
  );
}
