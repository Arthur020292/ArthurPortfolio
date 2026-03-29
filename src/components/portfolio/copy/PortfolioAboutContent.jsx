import { Fragment } from 'react';
import { aboutContent } from '../../../data';
import { BRAND_COLOR, CAL_COM_URL } from '../../../portfolio/constants';

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

        <div className="hidden max-[980px]:block">
          <p className="max-w-[24rem] text-[0.95rem] leading-[1.7] text-slate-500">
            You have a product you want to build?
          </p>
          <a
            className="portfolio-mobile-cta-enter mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-center text-[0.9rem] font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5"
            href={CAL_COM_URL}
            rel="noreferrer"
            ref={mobileBookCallCtaRef}
            style={{ backgroundColor: BRAND_COLOR }}
            target="_blank"
          >
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </div>
  );
}
