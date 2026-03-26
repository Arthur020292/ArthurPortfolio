import {
  BRAND_COLOR,
  CAL_COM_URL,
  CONTACT_EMAIL,
  LINKEDIN_URL,
} from '../../../portfolio/constants';
import { SectionLabel } from './SectionLabel';

export function PortfolioContactContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.3rem,4vw,4rem)] leading-[0.96] font-bold tracking-[-0.05em] text-slate-900">
          Let&apos;s talk about your next product.
        </h1>
        <p className="mt-6 max-w-[29rem] text-[1.02rem] leading-[1.8] text-slate-500">
          Tell me what you&apos;re building, where you need support, and what stage you&apos;re in.
          I work across product design, redesigns, UX systems, and frontend-ready execution.
        </p>

        <div className="mt-8">
          <a
            className="inline-flex min-h-13 items-center justify-center rounded-full px-5 py-4 text-center text-[1rem] font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
            href={CAL_COM_URL}
            rel="noreferrer"
            style={{ backgroundColor: BRAND_COLOR }}
            target="_blank"
          >
            Book a call
          </a>
          <p className="mt-3 max-w-[28rem] text-[0.95rem] leading-[1.7] text-slate-500">
            If scheduling is easier than writing an email, pick a time directly on my calendar.
          </p>
        </div>
      </div>

      <div className="portfolio-left-item mt-10">
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
