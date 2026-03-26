import { SectionLabel } from './SectionLabel';

export function PortfolioProjectsContent() {
  const featuredLabels = ['Platforms', 'Internal tools', 'Healthcare', 'Web experiences'];

  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          A broader view of the work.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500 max-[980px]:hidden">
          This page is the full browseable archive of product, UX, web, and internal-tool work.
          Start anywhere, then jump into each case study for deeper context and proof.
        </p>
      </div>

      <div className="portfolio-left-item mt-10 max-[980px]:hidden">
        <SectionLabel>What You&apos;ll Find</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {featuredLabels.map((label) => (
            <span
              className="rounded-full border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[0.84rem] font-medium text-slate-600"
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="portfolio-left-item mt-10 max-w-[30rem] max-[980px]:hidden">
        <p className="text-[1rem] leading-[1.8] text-slate-500">
          The strongest examples here show how I work across UX structure, visual systems,
          product thinking, and frontend-ready execution. If you&apos;re hiring for broad product
          design range, this is the best place to scan the full body of work.
        </p>
      </div>
    </div>
  );
}
