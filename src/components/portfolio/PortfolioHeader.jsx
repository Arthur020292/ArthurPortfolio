import { useLayoutEffect, useRef, useState } from 'react';
import {
  BRAND_COLOR,
  CAL_COM_URL,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from '../../portfolio/constants';
import { PortfolioNavLink } from './PortfolioNavLink';

function PortfolioHeaderNavLink({
  active,
  href,
  isInteractive,
  label,
  linkRef,
}) {
  const className = `relative z-10 transition-colors ${
    active ? 'text-slate-900' : 'hover:text-slate-900'
  }`;

  if (!isInteractive) {
    return (
      <span className={className} ref={linkRef}>
        {label}
      </span>
    );
  }

  return (
    <PortfolioNavLink
      aria-current={active ? 'page' : undefined}
      className={className}
      ref={linkRef}
      to={href}
    >
      {label}
    </PortfolioNavLink>
  );
}

export function PortfolioHeader({
  activeRoute,
  isInteractive = true,
  showMobileBookCall = true,
}) {
  const aboutLinkRef = useRef(null);
  const projectsLinkRef = useRef(null);
  const contactLinkRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    opacity: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    const activeKey =
      activeRoute === 'about' ? 'about' : activeRoute === 'contact' ? 'contact' : null;
    const normalizedActiveKey =
      activeRoute === 'projects' || activeRoute === 'project' ? 'projects' : activeKey;

    const activeElement =
      normalizedActiveKey === 'about'
        ? aboutLinkRef.current
        : normalizedActiveKey === 'projects'
          ? projectsLinkRef.current
          : normalizedActiveKey === 'contact'
            ? contactLinkRef.current
            : null;

    if (!activeElement) {
      setIndicatorStyle((current) => ({
        ...current,
        opacity: 0,
      }));
      return undefined;
    }

    const updateIndicator = () => {
      const indicatorWidth = 48;
      setIndicatorStyle({
        left: activeElement.offsetLeft + (activeElement.offsetWidth - indicatorWidth) / 2,
        opacity: 1,
        width: indicatorWidth,
      });
    };

    updateIndicator();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateIndicator);

      return () => {
        window.removeEventListener('resize', updateIndicator);
      };
    }

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(activeElement);

    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeRoute]);

  return (
    <nav
      aria-label="Primary"
      className="flex w-full items-baseline gap-6 text-[0.8rem] text-slate-500 max-[640px]:gap-4 max-[480px]:text-[0.76rem]"
    >
      {isInteractive ? (
        <PortfolioNavLink
          className="font-heading text-[1.05rem] font-bold text-slate-900 no-underline"
          to={PORTFOLIO_HOME_PATH}
        >
          Arthur.
        </PortfolioNavLink>
      ) : (
        <span className="font-heading text-[1.05rem] font-bold text-slate-900">
          Arthur.
        </span>
      )}
      <div className="relative flex items-baseline gap-6 self-baseline pb-3 max-[640px]:gap-4 max-[480px]:pb-2">
        <PortfolioHeaderNavLink
          active={activeRoute === 'about'}
          href={PORTFOLIO_HOME_PATH}
          isInteractive={isInteractive}
          label="About"
          linkRef={aboutLinkRef}
        />
        <PortfolioHeaderNavLink
          active={activeRoute === 'projects' || activeRoute === 'project'}
          href={PORTFOLIO_PROJECTS_PATH}
          isInteractive={isInteractive}
          label="Project"
          linkRef={projectsLinkRef}
        />
        <PortfolioHeaderNavLink
          active={activeRoute === 'contact'}
          href={PORTFOLIO_CONTACT_PATH}
          isInteractive={isInteractive}
          label="Contact"
          linkRef={contactLinkRef}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-1 rounded-full transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            backgroundColor: BRAND_COLOR,
            opacity: indicatorStyle.opacity,
            transform: `translateX(${indicatorStyle.left}px)`,
            width: indicatorStyle.width,
          }}
        />
      </div>
      {isInteractive ? (
        <a
          className={`ml-auto inline-flex min-h-11 items-center justify-center self-center rounded-full px-4 py-2 text-center text-[0.86rem] font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5 max-[640px]:min-h-10 max-[640px]:px-3 max-[640px]:text-[0.8rem] ${
            showMobileBookCall ? '' : 'max-[980px]:hidden'
          }`}
          href={CAL_COM_URL}
          rel="noreferrer"
          style={{ backgroundColor: BRAND_COLOR }}
          target="_blank"
        >
          Book a Call
        </a>
      ) : (
        <span
          className="ml-auto inline-flex min-h-11 items-center justify-center self-center rounded-full px-4 py-2 text-center text-[0.86rem] font-semibold text-white max-[640px]:min-h-10 max-[640px]:px-3 max-[640px]:text-[0.8rem]"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Book a Call
        </span>
      )}
    </nav>
  );
}
