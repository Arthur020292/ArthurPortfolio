import { Fragment } from 'react';
import { aboutContent } from '../../../data';
import {
  BRAND_COLOR,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_RESUME_PATH,
} from '../../../portfolio/constants';
import { PortfolioNavLink } from '../PortfolioNavLink';

export function PortfolioAboutContent({
  mobileBookCallCtaRef,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[1] font-bold tracking-[-0.05em] text-slate-900">
          {aboutContent.title.split('\n').map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? <br /> : null}
              {index === 0 ? (
                <>
                  {line.split('Arthur')[0]}
                  <span style={{ color: BRAND_COLOR }}>Arthur</span>
                  {line.split('Arthur')[1]}
                </>
              ) : (
                line.split(' ').map((word, wordIndex) => (
                  <Fragment key={`${line}-${word}`}>
                    {wordIndex > 0 ? ' ' : null}
                    {word}
                  </Fragment>
                ))
              )}
            </Fragment>
          ))}
        </h1>
      </div>

      <div className="portfolio-left-item mt-8 grid gap-5 pb-10">
        {aboutContent.summary.map((paragraph) => (
          <p
            className="max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}

        <div className="rounded-[8px] border border-slate-200 bg-[#fbfaf7] p-6 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
          <h2 className="font-heading text-[1.55rem] leading-[1.1] font-medium tracking-[-0.04em] text-slate-900">
            {aboutContent.ctaTitle}
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <PortfolioNavLink
              className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-center text-[0.9rem] font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
              ref={mobileBookCallCtaRef}
              style={{ backgroundColor: BRAND_COLOR }}
              to={PORTFOLIO_CONTACT_PATH}
            >
              Start a conversation
            </PortfolioNavLink>
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-[0.9rem] font-semibold text-slate-700 no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900"
              href={PORTFOLIO_RESUME_PATH}
              rel="noreferrer"
              target="_blank"
            >
              View Resume
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
