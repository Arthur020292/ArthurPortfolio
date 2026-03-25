import { Fragment } from 'react';
import { aboutContent } from '../../../data';
import { BRAND_COLOR } from '../../../portfolio/constants';
import { SectionLabel } from './SectionLabel';

export function PortfolioAboutContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
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

      <div className="portfolio-left-item mt-8 grid gap-5">
        {aboutContent.summary.map((paragraph) => (
          <p
            className="max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="portfolio-left-item mt-10">
        <SectionLabel>Capabilities</SectionLabel>
        <div className="mt-4 grid gap-4">
          {aboutContent.capabilityGroups.map((group) => (
            <section
              className="rounded-[24px] border border-slate-200 bg-white/78 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
              key={group.title}
            >
              <h2 className="font-heading text-[1.08rem] font-bold tracking-[-0.03em] text-slate-900">
                {group.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    className="rounded-full border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[0.84rem] font-medium text-slate-600"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="portfolio-left-item mt-10">
        <SectionLabel>Experience</SectionLabel>
        <div className="mt-4 grid gap-3">
          {aboutContent.experience.map((item) => (
            <article
              className="rounded-[22px] border border-slate-200/90 bg-[#fbfaf7] p-5"
              key={item}
            >
              <p className="text-[0.98rem] leading-[1.75] text-slate-600">{item}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="portfolio-left-item mt-10 pb-10">
        <SectionLabel>Tools & Workflow</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {aboutContent.tools.map((tool) => (
            <span
              className="rounded-full bg-slate-900 px-3 py-1.5 text-[0.82rem] font-medium tracking-[0.01em] text-white"
              key={tool}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
