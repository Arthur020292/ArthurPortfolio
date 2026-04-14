import { CONTACT_EMAIL, LINKEDIN_URL } from '../../../portfolio/constants';
import { SectionLabel } from './SectionLabel';

export function PortfolioContactContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item max-[980px]:hidden">
        <h1 className="font-heading text-[clamp(2.3rem,4vw,4rem)] leading-[0.96] font-bold tracking-[-0.05em] text-slate-900">
          Let&apos;s talk about your product.
        </h1>
        <p className="mt-6 max-w-[29rem] text-[1.02rem] leading-[1.8] text-slate-500 max-[980px]:hidden">
          Tell me what you&apos;re building, where you need support, and what stage you&apos;re in.
          I work across product design, redesigns, UX systems, and frontend-ready execution.
        </p>
      </div>

      <div className="portfolio-left-item mt-10 max-[980px]:hidden">
        <SectionLabel>Quick Contact</SectionLabel>
        <div className="mt-4 grid gap-3">
          <a
            className="inline-flex text-[1rem] text-slate-700 no-underline transition-colors hover:text-slate-900"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          <a
            className="inline-flex text-[1rem] text-slate-700 no-underline transition-colors hover:text-slate-900"
            href={LINKEDIN_URL}
            rel="noreferrer"
            target="_blank"
          >
            Message me on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
