import { BRAND_COLOR, PORTFOLIO_CONTACT_PATH } from '../../portfolio/constants';
import { PortfolioNavLink } from './PortfolioNavLink';

function PortfolioContactFooterCtaShell({
  as: Component = 'div',
  children,
  className = '',
  ...props
}) {
  return (
    <Component
      className={`group relative block overflow-hidden border-t border-slate-200 bg-[#f3f0ea] px-5 py-10 text-inherit no-underline max-[720px]:px-6 max-[720px]:py-12 ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="portfolio-project-overlay absolute inset-0"
      />
      {children}
    </Component>
  );
}

export function PortfolioContactFooterCtaContent() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-center gap-12 max-[720px]:gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-[34rem]">
        <h2 className="font-heading text-[clamp(2.25rem,3vw,3.5rem)] leading-[0.94] font-medium tracking-[-0.05em] text-slate-900 transition-colors duration-500 group-hover:text-white group-focus-visible:text-white max-[720px]:text-[clamp(2rem,11vw,2.7rem)]">
          Tell me about your project.
        </h2>
        <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.8] text-slate-600 transition-colors duration-500 group-hover:text-slate-200 group-focus-visible:text-slate-200 max-[720px]:mt-3 max-[720px]:text-[0.96rem] max-[720px]:leading-[1.7]">
          If you need product design, UX systems, or frontend-ready execution, I can help shape
          the work and move it toward something shippable.
        </p>
      </div>

      <div className="flex flex-col items-start max-[720px]:w-full lg:items-center">
        <span
          className="inline-flex min-h-14 min-w-[17rem] items-center justify-center rounded-full px-8 py-3 text-center text-[0.98rem] font-semibold text-white whitespace-nowrap transition-colors duration-300 group-hover:bg-white group-hover:text-slate-900 group-focus-visible:bg-white group-focus-visible:text-slate-900 max-[720px]:min-h-12 max-[720px]:w-full max-[720px]:min-w-0 max-[720px]:px-6 max-[720px]:text-[0.95rem] max-[720px]:whitespace-normal"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Start a conversation
        </span>
      </div>
    </div>
  );
}

export function PortfolioContactFooterCtaSection({ className = '' }) {
  return (
    <PortfolioContactFooterCtaShell as={PortfolioNavLink} className={className} to={PORTFOLIO_CONTACT_PATH}>
      <PortfolioContactFooterCtaContent />
    </PortfolioContactFooterCtaShell>
  );
}
