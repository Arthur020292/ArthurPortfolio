import { Fragment } from 'react';
import { aboutContent } from '../../../data';
import { BRAND_COLOR, PORTFOLIO_CONTACT_PATH } from '../../../portfolio/constants';
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
        <p className="mt-3 text-[1rem] font-medium tracking-[0.01em] text-slate-500">
          AI-Augmented Design &amp; Development
        </p>
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

        <section className="grid gap-4 border-t border-slate-200/80 pt-6">
          {aboutContent.capabilityGroups.map((group) => (
            <div
              className="rounded-[16px] border border-slate-200 bg-[#fbfaf7] p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)]"
              key={group.title}
            >
              <h2 className="font-heading text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-900">
                {group.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-[1.75] text-slate-600">
                {group.items.join(', ')}.
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 border-t border-slate-200/80 pt-6">
          <h2 className="font-heading text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-900">
            Experience Snapshot
          </h2>
          <ul className="grid gap-2.5 list-disc pl-5">
            {aboutContent.experience.map((item) => (
              <li
                className="text-[0.98rem] leading-[1.75] text-slate-600 marker:text-slate-400"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 border-t border-slate-200/80 pt-6">
          <h2 className="font-heading text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-900">
            Tools I Use
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {aboutContent.tools.map((tool) => (
              <span
                className="rounded-full border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[0.82rem] font-medium text-slate-700"
                key={tool}
              >
                {tool}
              </span>
            ))}
          </div>
        </section>

        <div className="rounded-[8px] border border-slate-200 bg-[#fbfaf7] p-6 shadow-[0_14px_36px_rgba(15,23,42,0.04)] max-[980px]:hidden">
          <h2 className="font-heading text-[1.55rem] leading-[1.1] font-medium tracking-[-0.04em] text-slate-900">
            You have a product you want to build?
          </h2>
          <PortfolioNavLink
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-center text-[0.9rem] font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
            ref={mobileBookCallCtaRef}
            style={{ backgroundColor: BRAND_COLOR }}
            to={PORTFOLIO_CONTACT_PATH}
          >
            Let&apos;s Talk
          </PortfolioNavLink>
        </div>

      </div>
    </div>
  );
}
