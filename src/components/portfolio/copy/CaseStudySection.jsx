export function CaseStudySection({ section }) {
  return (
    <section className="border-t border-slate-200/80 pt-5 max-[640px]:pt-4">
      <h2 className="font-heading text-[1.05rem] font-bold tracking-[-0.03em] text-slate-900 max-[640px]:text-[1rem]">
        {section.title}
      </h2>

      {section.body ? (
        <p className="mt-3 text-[0.98rem] leading-[1.75] text-slate-600 max-[640px]:text-[0.94rem] max-[640px]:leading-[1.68]">
          {section.body}
        </p>
      ) : null}

      {section.items?.length ? (
        <ul className="mt-3 grid gap-2.5 list-disc pl-5 max-[640px]:gap-2 max-[640px]:pl-4">
          {section.items.map((item) => (
            <li
              className="text-[0.96rem] leading-[1.7] text-slate-600 marker:text-slate-400 max-[640px]:text-[0.93rem] max-[640px]:leading-[1.62]"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
