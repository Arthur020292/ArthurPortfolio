import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { aboutContent, projects } from './data';

const LEGACY_DESIGN_ONE_PATH = '/design1';
const LEGACY_DESIGN_TWO_PATH = '/design2';
const PORTFOLIO_HOME_PATH = '/';
const PORTFOLIO_CONTACT_PATH = '/contact';
const PORTFOLIO_PROJECTS_PATH = '/projects';
const BRAND_COLOR = '#eb6e51';
const CONTACT_EMAIL = 'arthur.baduyen@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/arthurbaduyenf/';
const SITE_NAME = 'Arthur Baduyen';
const DEFAULT_META_DESCRIPTION =
  'Arthur Baduyen is a Senior Product Designer focused on product UX, frontend-ready design, and AI-augmented delivery.';
const DEFAULT_SOCIAL_IMAGE_PATH = '/assets/work/zip-thumb-v2.png';
const DESIGN_TWO_EXIT_MS = 220;
const DESIGN_TWO_ENTER_MS = 420;
const ENV_SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || '';

function getSiteUrl() {
  if (ENV_SITE_URL) {
    return ENV_SITE_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return '';
}

function getProjectPath(slug) {
  return `${PORTFOLIO_PROJECTS_PATH}/${slug}`;
}

function toAbsoluteUrl(path) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return path;
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function setMetaTag({ content, name, property }) {
  if (!content) {
    return;
  }

  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');

    if (name) {
      element.setAttribute('name', name);
    }

    if (property) {
      element.setAttribute('property', property);
    }

    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setCanonicalLink(href) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setStructuredData(data) {
  let script = document.head.querySelector('script[data-portfolio-schema="true"]');

  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-portfolio-schema', 'true');
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

function useDocumentMeta({
  description = DEFAULT_META_DESCRIPTION,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  path = PORTFOLIO_HOME_PATH,
  title,
  type = 'website',
}) {
  useEffect(() => {
    document.title = title;

    const canonicalUrl = toAbsoluteUrl(path);
    const imageUrl = toAbsoluteUrl(imagePath);

    setMetaTag({ name: 'description', content: description });
    setMetaTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });
    setMetaTag({ property: 'og:site_name', content: SITE_NAME });
    setMetaTag({ property: 'og:title', content: title });
    setMetaTag({ property: 'og:description', content: description });
    setMetaTag({ property: 'og:type', content: type });
    setMetaTag({ property: 'og:url', content: canonicalUrl || path });
    setMetaTag({ property: 'og:image', content: imageUrl || imagePath });
    setMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
    setMetaTag({ name: 'twitter:title', content: title });
    setMetaTag({ name: 'twitter:description', content: description });
    setMetaTag({ name: 'twitter:image', content: imageUrl || imagePath });

    if (canonicalUrl) {
      setCanonicalLink(canonicalUrl);
    }

    if (type === 'article') {
      setStructuredData({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        author: {
          '@type': 'Person',
          email: CONTACT_EMAIL,
          jobTitle: 'Senior Product Designer',
          name: SITE_NAME,
          sameAs: [LINKEDIN_URL],
        },
        description,
        image: imageUrl ? [imageUrl] : undefined,
        headline: title,
        name: title,
        url: canonicalUrl || path,
      });

      return;
    }

    setStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          email: CONTACT_EMAIL,
          jobTitle: 'Senior Product Designer',
          name: SITE_NAME,
          sameAs: [LINKEDIN_URL],
          url: getSiteUrl() || undefined,
        },
        {
          '@type': 'WebSite',
          description: DEFAULT_META_DESCRIPTION,
          image: imageUrl || imagePath,
          name: SITE_NAME,
          url: getSiteUrl() || canonicalUrl || path,
        },
      ],
    });
  }, [description, imagePath, path, title, type]);
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

function SafeImage({
  alt,
  className = '',
  decoding = 'async',
  fallbackClassName = '',
  fallbackLabel = 'Preview',
  fetchPriority = 'auto',
  loading = 'lazy',
  src,
}) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div
        aria-label={alt}
        className={`grid place-items-center bg-white/50 text-center ${fallbackClassName || className}`}
        role="img"
      >
        <span className="font-heading text-lg tracking-[-0.03em] text-slate-600">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      decoding={decoding}
      fetchPriority={fetchPriority}
      loading={loading}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

function parsePortfolioRoute(pathname) {
  const normalizedPath =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalizedPath === PORTFOLIO_HOME_PATH) {
    return { key: 'about', type: 'about' };
  }

  if (normalizedPath === PORTFOLIO_PROJECTS_PATH) {
    return { key: 'projects', type: 'projects' };
  }

  if (normalizedPath === PORTFOLIO_CONTACT_PATH) {
    return { key: 'contact', type: 'contact' };
  }

  const match = normalizedPath.match(/^\/projects\/([^/]+)$/);

  if (match) {
    const project = projects.find((entry) => entry.slug === match[1]);

    if (project) {
      return {
        key: `project:${project.slug}`,
        project,
        type: 'project',
      };
    }
  }

  return { key: 'missing', type: 'missing' };
}

function isOverviewRoute(type) {
  return type === 'about' || type === 'projects';
}

function PortfolioLayout() {
  const location = useLocation();
  const actualRoute = parsePortfolioRoute(location.pathname);
  const prefersReducedMotion = usePrefersReducedMotion();
  const leftPanelRef = useRef(null);
  const mainContentRef = useRef(null);
  const previousPathRef = useRef(location.pathname);
  const lastLeftScrollRef = useRef(0);
  const [displayedRoute, setDisplayedRoute] = useState(actualRoute);
  const [transitionState, setTransitionState] = useState('idle');
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [overviewGridMotion, setOverviewGridMotion] = useState(null);
  const disableRightPanelTransition =
    isOverviewRoute(actualRoute.type) && isOverviewRoute(displayedRoute.type);

  useDocumentMeta(
    actualRoute.type === 'project'
      ? {
          description: actualRoute.project.metaDescription,
          imagePath: actualRoute.project.cardImage || actualRoute.project.heroImage,
          path: getProjectPath(actualRoute.project.slug),
          title: actualRoute.project.metaTitle,
          type: 'article',
        }
      : actualRoute.type === 'contact'
        ? {
            description:
              'Contact Arthur Baduyen about product design, UI/UX, design systems, and frontend-ready collaboration.',
            imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
            path: PORTFOLIO_CONTACT_PATH,
            title: 'Arthur Baduyen | Contact',
          }
        : actualRoute.type === 'projects'
          ? {
              description:
                'Browse product design, UX, web, and internal tool case studies by Arthur Baduyen.',
              imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
              path: PORTFOLIO_PROJECTS_PATH,
              title: 'Arthur Baduyen | Projects',
            }
        : {
            description: DEFAULT_META_DESCRIPTION,
            imagePath: DEFAULT_SOCIAL_IMAGE_PATH,
            path: PORTFOLIO_HOME_PATH,
            title: 'Arthur Baduyen | Senior Product Designer',
          }
  );

  useEffect(() => {
    if (actualRoute.type === 'missing' || actualRoute.key === displayedRoute.key) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setDisplayedRoute(actualRoute);
      setTransitionState('idle');
      setOverviewGridMotion(null);
      return undefined;
    }

    setTransitionState('exit');

    const swapTimer = window.setTimeout(() => {
      setOverviewGridMotion(
        isOverviewRoute(displayedRoute.type) && isOverviewRoute(actualRoute.type)
          ? {
              from: displayedRoute.type,
              to: actualRoute.type,
              token: `${displayedRoute.type}-${actualRoute.type}-${Date.now()}`,
            }
          : null
      );
      setDisplayedRoute(actualRoute);
      setTransitionState('enter');
    }, DESIGN_TWO_EXIT_MS);

    const finishTimer = window.setTimeout(() => {
      setTransitionState('idle');
      setOverviewGridMotion(null);
    }, DESIGN_TWO_EXIT_MS + DESIGN_TWO_ENTER_MS);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(finishTimer);
    };
  }, [actualRoute, displayedRoute.key, prefersReducedMotion]);

  useEffect(() => {
    const panel = leftPanelRef.current;

    if (!panel) {
      return undefined;
    }

    const handleScroll = () => {
      const currentScrollTop = panel.scrollTop;
      const previousScrollTop = lastLeftScrollRef.current;
      const isScrollingUp = currentScrollTop < previousScrollTop;
      const shouldShowStickyNav = currentScrollTop > 140 && isScrollingUp;

      setShowStickyNav((current) =>
        current === shouldShowStickyNav ? current : shouldShowStickyNav
      );

      lastLeftScrollRef.current = currentScrollTop;
    };

    handleScroll();
    panel.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      panel.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const panel = leftPanelRef.current;

    if (!panel) {
      return;
    }

    lastLeftScrollRef.current = panel.scrollTop;
    setShowStickyNav(false);
  }, [displayedRoute.key]);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    mainContentRef.current?.focus({ preventScroll: true });
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  if (actualRoute.type === 'missing') {
    return <Navigate replace to={PORTFOLIO_HOME_PATH} />;
  }

  return (
    <>
      <a className="skip-link" href="#portfolio-main-content">
        Skip to main content
      </a>
      <main
        className="min-h-dvh overflow-hidden bg-white"
        id="portfolio-main-content"
        ref={mainContentRef}
        tabIndex={-1}
      >
      <div className="relative grid min-h-dvh grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] overflow-hidden bg-white max-[980px]:grid-cols-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[45%] z-20 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(223,218,210,0.35),rgba(223,218,210,0.8),rgba(223,218,210,0.35))] shadow-[0_0_18px_rgba(255,255,255,0.55)] max-[980px]:hidden"
        />
        <section
          aria-label="Portfolio details"
          className="portfolio-copy relative flex h-dvh min-h-dvh flex-col overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,250,0.98))] px-12 py-10 max-[980px]:h-auto max-[980px]:min-h-0 max-[980px]:overflow-visible max-[980px]:border-b max-[980px]:border-[#ece7df] max-[980px]:px-7 max-[980px]:py-8"
          ref={leftPanelRef}
        >
          <div className="relative z-30 max-[980px]:sticky max-[980px]:top-0 max-[980px]:-mx-7 max-[980px]:mb-6 max-[980px]:border-b max-[980px]:border-[#ece7df] max-[980px]:bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.94))] max-[980px]:px-7 max-[980px]:py-4 max-[980px]:backdrop-blur-sm">
            <PortfolioHeader activeRoute={actualRoute.type} />
          </div>
          {showStickyNav ? (
            <div className="pointer-events-none sticky -top-10 z-30 -mx-12 mb-0 pt-0 pb-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-0 opacity-100 max-[980px]:hidden">
              <div className="pointer-events-auto border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.94))] px-12 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                <PortfolioHeader activeRoute={actualRoute.type} />
              </div>
            </div>
          ) : null}
          <div
            className={`mt-10 flex-1 ${transitionState === 'exit' ? 'portfolio-left-stage-exit' : ''} ${transitionState === 'enter' ? 'portfolio-left-stage-enter' : ''}`}
            key={displayedRoute.key}
          >
            <PortfolioLeftContent route={displayedRoute} />
          </div>
        </section>

        <section
          aria-label={
            displayedRoute.type === 'project'
              ? `${displayedRoute.project.name} screens`
              : displayedRoute.type === 'projects'
                ? 'Projects'
                : 'Portfolio showcase'
          }
          className={`relative h-dvh min-h-dvh ${displayedRoute.type === 'about' || displayedRoute.type === 'projects' ? 'overflow-y-auto overflow-x-hidden bg-[#fbfaf7]' : 'overflow-hidden'} ${!disableRightPanelTransition && transitionState === 'exit' ? 'portfolio-right-stage-exit' : ''} ${!disableRightPanelTransition && transitionState === 'enter' ? 'portfolio-right-stage-enter' : ''} max-[980px]:h-auto max-[980px]:overflow-visible`}
          key={`${displayedRoute.key}-panel`}
        >
          <PortfolioRightContent overviewGridMotion={overviewGridMotion} route={displayedRoute} />
        </section>
      </div>
      </main>
    </>
  );
}

function PortfolioHeader({ activeRoute, isInteractive = true }) {
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
    <nav aria-label="Primary" className="flex items-baseline gap-6 text-[0.8rem] text-slate-500">
      {isInteractive ? (
        <Link
          className="font-heading text-[1.05rem] font-bold text-slate-900 no-underline"
          to={PORTFOLIO_HOME_PATH}
        >
          Arthur.
        </Link>
      ) : (
        <span className="font-heading text-[1.05rem] font-bold text-slate-900">
          Arthur.
        </span>
      )}
      <div className="relative flex items-baseline gap-6 pb-3">
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
    </nav>
  );
}

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
    <Link
      aria-current={active ? 'page' : undefined}
      className={className}
      ref={linkRef}
      to={href}
    >
      {label}
    </Link>
  );
}

function PortfolioLeftContent({ route }) {
  if (route.type === 'about') {
    return <PortfolioAboutContent />;
  }

  if (route.type === 'projects') {
    return <PortfolioProjectsContent />;
  }

  if (route.type === 'contact') {
    return <PortfolioContactContent />;
  }

  return <PortfolioProjectDetails project={route.project} />;
}

function PortfolioProjectDetails({ project }) {
  const currentIndex = projects.findIndex((entry) => entry.slug === project.slug);
  const previousProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        <div className="portfolio-left-item">
          <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            {project.shortMeta.label}
          </p>
          <h1 className="mt-4 font-heading text-[clamp(2.6rem,5vw,4.7rem)] leading-[0.95] font-bold tracking-[-0.055em] text-slate-900">
            {project.name}
          </h1>
        </div>

        <div className="portfolio-left-item mt-8 max-w-[28rem]">
          <p className="text-[1.08rem] leading-[1.85] text-slate-500">
            {project.shortMeta.summary}
          </p>
        </div>

        <dl className="portfolio-left-item mt-8 grid gap-5 text-sm text-slate-500">
          {project.shortMeta.details.map((item) => (
            <div key={item.label}>
              <dt className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 text-[0.98rem] leading-[1.6] text-slate-800">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {project.caseStudySections?.length ? (
          <div className="portfolio-left-item mt-10 grid gap-4">
            {project.caseStudySections.map((section) => (
              <CaseStudySection key={section.title} section={section} />
            ))}
          </div>
        ) : null}

        {project.caseStudyTools?.length ? (
          <div className="portfolio-left-item mt-10">
            <SectionLabel>Tools & Technologies</SectionLabel>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {project.caseStudyTools.map((tool) => (
                <span
                  className="rounded-full border border-slate-200 bg-[#fbfaf7] px-3 py-1.5 text-[0.82rem] font-medium text-slate-700"
                  key={tool}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="portfolio-left-item -mx-12 -mb-10 mt-10 border-t border-slate-200/80 bg-[rgba(250,250,250,0.98)] px-12 py-6 shadow-[0_-14px_24px_rgba(15,23,42,0.04)] max-[980px]:mx-0 max-[980px]:mb-0 max-[980px]:mt-8 max-[980px]:bg-transparent max-[980px]:px-0 max-[980px]:py-7 max-[980px]:shadow-none">
        <nav aria-label="Project navigation" className="flex items-center gap-4 text-[0.96rem]">
          {previousProject ? (
            <Link
              className="text-slate-500 transition-colors hover:text-slate-900"
              to={getProjectPath(previousProject.slug)}
            >
              Previous project
            </Link>
          ) : (
            <span className="cursor-not-allowed text-slate-300">Previous project</span>
          )}
          <span className="text-slate-300">|</span>
          {nextProject ? (
            <Link
              className="text-slate-500 transition-colors hover:text-slate-900"
              to={getProjectPath(nextProject.slug)}
            >
              Next project
            </Link>
          ) : (
            <span className="cursor-not-allowed text-slate-300">Next project</span>
          )}
        </nav>
      </div>
    </div>
  );
}

function CaseStudySection({ section }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <h2 className="font-heading text-[1.05rem] font-bold tracking-[-0.03em] text-slate-900">
        {section.title}
      </h2>

      {section.body ? (
        <p className="mt-3 text-[0.98rem] leading-[1.75] text-slate-600">{section.body}</p>
      ) : null}

      {section.items?.length ? (
        <ul className="mt-3 grid gap-2.5 list-disc pl-5">
          {section.items.map((item) => (
            <li
              className="text-[0.96rem] leading-[1.7] text-slate-600 marker:text-slate-400"
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

function PortfolioAboutContent() {
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

function PortfolioProjectsContent() {
  const featuredLabels = ['Platforms', 'Internal tools', 'Healthcare', 'Web experiences'];

  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Project Index
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          A broader view of the work.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500">
          This page is the full browseable archive of product, UX, web, and internal-tool
          work. Start anywhere, then jump into each case study for deeper context and proof.
        </p>
      </div>

      <div className="portfolio-left-item mt-10">
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

      <div className="portfolio-left-item mt-10 max-w-[30rem]">
        <p className="text-[1rem] leading-[1.8] text-slate-500">
          The strongest examples here show how I work across UX structure, visual systems,
          product thinking, and frontend-ready execution. If you&apos;re hiring for broad
          product design range, this is the best place to scan the full body of work.
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </p>
  );
}

function PortfolioContactContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="portfolio-left-item">
        <h1 className="font-heading text-[clamp(2.3rem,4vw,4rem)] leading-[0.96] font-bold tracking-[-0.05em] text-slate-900">
          Let&apos;s talk about your next product.
        </h1>
        <p className="mt-6 max-w-[29rem] text-[1.02rem] leading-[1.8] text-slate-500">
          Tell me what you&apos;re building, where you need support, and what stage you&apos;re in. I work across product design, redesigns, UX systems, and frontend-ready execution.
        </p>
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

function PortfolioRightContent({ overviewGridMotion, route }) {
  if (route.type === 'about') {
    return <PortfolioProjectGrid mode="featured" overviewGridMotion={overviewGridMotion} />;
  }

  if (route.type === 'projects') {
    return <PortfolioProjectGrid mode="all" overviewGridMotion={overviewGridMotion} />;
  }

  if (route.type === 'contact') {
    return <PortfolioContactPanel />;
  }

  return <PortfolioProjectViewer project={route.project} />;
}

function PortfolioProjectGrid({ mode = 'all', overviewGridMotion }) {
  const location = useLocation();
  const featuredProjectOrder = [
    'zip',
    'chronomedia',
    'nester',
    'kidough',
    'workrite',
    'harvest21',
  ];
  const browseProjectOrder = [
    'zip',
    'chronomedia',
    'nester',
    'kidough',
    'workrite',
    'harvest21',
    'portlandpedalpower',
    'msp',
    'spokehealth',
    'chromedia',
    'mrioa',
    'contractsrx',
    'nlrp',
  ];

  const prioritizedProjects = [
    ...(mode === 'featured' ? featuredProjectOrder : browseProjectOrder)
      .map((slug) => projects.find((project) => project.slug === slug))
      .filter(Boolean),
  ];
  const orderedProjects =
    mode === 'featured'
      ? prioritizedProjects
      : [
          ...prioritizedProjects,
          ...projects.filter((project) => !browseProjectOrder.includes(project.slug)),
        ];
  const remainingDesktopSlots = (3 - (orderedProjects.length % 3)) % 3;
  const isWideContactTile = remainingDesktopSlots === 2;
  const showContactTile = mode === 'featured' || remainingDesktopSlots > 0;
  const contactTileLayoutClass =
    mode === 'featured'
      ? 'col-span-3 max-[980px]:col-span-2 max-[720px]:col-span-1'
      : isWideContactTile
        ? 'portfolio-contact-tile-span-2'
        : '';
  const gridMotionClass =
    overviewGridMotion?.to === 'projects' && mode === 'all'
      ? 'portfolio-grid-overview-expand'
      : overviewGridMotion?.to === 'about' && mode === 'featured'
        ? 'portfolio-grid-overview-collapse'
        : '';
  const leadProjects =
    mode === 'all' ? orderedProjects.slice(0, featuredProjectOrder.length) : orderedProjects;
  const trailingProjects =
    mode === 'all' ? orderedProjects.slice(featuredProjectOrder.length) : [];

  useEffect(() => {
    if (location.hash !== '#projects') {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById('portfolio-projects-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [location.hash]);

  return (
    <div
      className="portfolio-right-panel flex h-full min-h-full flex-col border-l border-slate-200 bg-[#fbfaf7] max-[980px]:min-h-[55vh] max-[980px]:border-l-0"
      id="portfolio-projects-section"
    >
      <div className="hidden border-b border-slate-200 px-10 py-7 max-[980px]:block max-[980px]:px-7">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Projects
        </p>
      </div>

      <div
        className={`relative grid flex-1 grid-cols-3 border-r border-b border-slate-200 bg-[#fbfaf7] max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 ${gridMotionClass}`}
        key={overviewGridMotion?.token || mode}
      >
        {leadProjects.map((project) => (
          <Link
            className={`portfolio-project-tile group flex min-h-0 flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline max-[980px]:p-6 ${
              mode === 'all' ? 'portfolio-project-tile-shared' : ''
            }`}
            key={project.slug}
            to={getProjectPath(project.slug)}
          >
            <span
              aria-hidden="true"
              className="portfolio-project-overlay absolute inset-0"
            />

            <div className="relative z-10">
              <h2 className="portfolio-project-title max-w-[11ch] font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900">
                {project.name}
              </h2>
            </div>

            <div className="relative z-10 mt-8">
              <p className="portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {project.category}
              </p>
              <div className="portfolio-project-bar mt-4 h-1.5 w-12 rounded-full bg-slate-200">
                <div
                  className="portfolio-project-bar-fill h-full origin-left rounded-full"
                  style={{ backgroundColor: project.accentColor }}
                />
              </div>
            </div>
          </Link>
        ))}

        {trailingProjects.map((project, index) => (
          <Link
            className="portfolio-project-tile portfolio-project-tile-new group flex min-h-0 flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline max-[980px]:p-6"
            key={project.slug}
            style={
              overviewGridMotion?.to === 'projects'
                ? { animationDelay: `${80 + index * 70}ms` }
                : undefined
            }
            to={getProjectPath(project.slug)}
          >
            <span
              aria-hidden="true"
              className="portfolio-project-overlay absolute inset-0"
            />

            <div className="relative z-10">
              <h2 className="portfolio-project-title max-w-[11ch] font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900">
                {project.name}
              </h2>
            </div>

            <div className="relative z-10 mt-8">
              <p className="portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {project.category}
              </p>
              <div className="portfolio-project-bar mt-4 h-1.5 w-12 rounded-full bg-slate-200">
                <div
                  className="portfolio-project-bar-fill h-full origin-left rounded-full"
                  style={{ backgroundColor: project.accentColor }}
                />
              </div>
            </div>
          </Link>
        ))}

        {showContactTile ? (
          <Link
            className={`portfolio-project-tile portfolio-contact-tile group flex min-h-0 flex-col justify-between bg-[#f3f0ea] p-8 text-inherit no-underline max-[980px]:p-6 ${
              mode === 'all' ? 'portfolio-project-tile-new' : ''
            } ${
              mode === 'featured' ? 'portfolio-featured-cta-row' : ''
            } ${
              contactTileLayoutClass
            }`}
            style={
              mode === 'all' && overviewGridMotion?.to === 'projects'
                ? { animationDelay: `${80 + trailingProjects.length * 70}ms` }
                : undefined
            }
            to={PORTFOLIO_CONTACT_PATH}
          >
            <span
              aria-hidden="true"
              className="portfolio-project-overlay absolute inset-0"
            />

            {mode === 'featured' ? (
              <FeaturedProjectCtaContent />
            ) : (
              <>
                <div className="relative z-10">
                  <h2
                    className={`portfolio-project-title font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900 ${
                      isWideContactTile ? 'max-w-[18ch]' : 'max-w-[12ch]'
                    }`}
                  >
                    Tell me about your project.
                  </h2>
                </div>

                <div className="relative z-10 mt-8">
                  <p
                    className={`portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase ${
                      isWideContactTile ? 'max-w-none' : ''
                    }`}
                  >
                    Start a conversation
                  </p>
                  <div className="portfolio-project-bar mt-6 h-1.5 w-12 rounded-full bg-slate-200">
                    <div
                      className="portfolio-project-bar-fill h-full origin-left rounded-full"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                  </div>
                </div>
              </>
            )}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function FeaturedProjectCtaContent() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-[34rem]">
        <p className="portfolio-project-category text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase">
          Start a conversation
        </p>
        <h2 className="mt-4 font-heading text-[clamp(2.25rem,3vw,3.5rem)] leading-[0.94] font-medium tracking-[-0.05em] text-slate-900 transition-colors duration-500 group-hover:text-white group-focus-visible:text-white">
          Tell me about your project.
        </h2>
        <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.8] text-slate-600 transition-colors duration-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">
          If you need product design, UX systems, or frontend-ready execution, I can help shape
          the work and move it toward something shippable.
        </p>
      </div>

      <div className="flex flex-col items-start lg:items-center">
        <span
          className="inline-flex min-h-14 min-w-[17rem] items-center justify-center rounded-full px-8 py-3 text-center text-[0.98rem] font-semibold text-white whitespace-nowrap transition-colors duration-300 group-hover:bg-white group-hover:text-slate-900 group-focus-visible:bg-white group-focus-visible:text-slate-900 max-[720px]:min-w-0 max-[720px]:whitespace-normal"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Start a conversation
        </span>
      </div>
    </div>
  );
}

function PortfolioContactPanel() {
  const [formState, setFormState] = useState({
    company: '',
    email: '',
    message: '',
    name: '',
    projectType: '',
  });
  const [submitState, setSubmitState] = useState({
    message: '',
    status: 'idle',
  });
  const isSubmitting = submitState.status === 'submitting';

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitState({
      message: '',
      status: 'submitting',
    });

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify(formState),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitState({
          message: result.message || 'I could not send your message right now.',
          status: 'error',
        });
        return;
      }

      setFormState({
        company: '',
        email: '',
        message: '',
        name: '',
        projectType: '',
      });
      setSubmitState({
        message: result.message || 'Thanks, your message has been sent.',
        status: 'success',
      });
    } catch {
      setSubmitState({
        message: 'I could not send your message right now. Please try again later.',
        status: 'error',
      });
    }
  }

  return (
    <div className="portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f7f3ed_0%,#f2ede5_100%)] px-14 py-12 max-[980px]:min-h-[48vh] max-[980px]:px-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.9),transparent_26%),radial-gradient(circle_at_78%_74%,rgba(15,23,42,0.06),transparent_24%)]" />
      <div className="relative z-10 w-full max-w-[36rem] rounded-[32px] border border-white/65 bg-white/78 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-md max-[980px]:p-6">
        <form aria-busy={isSubmitting} className="grid gap-4" onSubmit={handleSubmit}>
          <div aria-hidden="true" className="hidden">
            <label className="block">
              Company
              <input
                autoComplete="off"
                name="company"
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                tabIndex={-1}
                type="text"
                value={formState.company}
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Name
            </span>
            <input
              autoComplete="name"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="name"
              placeholder="Your name"
              required
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              type="text"
              value={formState.name}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Email
            </span>
            <input
              autoComplete="email"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="email"
              placeholder="you@company.com"
              required
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              type="email"
              value={formState.email}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Project Type
            </span>
            <select
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="projectType"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  projectType: event.target.value,
                }))
              }
              value={formState.projectType}
            >
              <option value="">Select one if helpful</option>
              <option value="New product">New product</option>
              <option value="Redesign">Redesign</option>
              <option value="Design system">Design system</option>
              <option value="Frontend-ready design">Frontend-ready design</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Message
            </span>
            <textarea
              className="min-h-44 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="message"
              placeholder="A quick overview of what you're building, where you need help, and what timeline you're working with."
              required
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              value={formState.message}
            />
          </label>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <button
              className="inline-flex min-h-13 items-center justify-center rounded-full px-5 py-4 text-center text-[1rem] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ backgroundColor: BRAND_COLOR }}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>

            <p
              aria-atomic="true"
              aria-live="polite"
              className={`mt-4 text-[0.95rem] ${
                submitState.status === 'error' ? 'text-red-600' : 'text-slate-500'
              }`}
              role={submitState.status === 'error' ? 'alert' : 'status'}
            >
              {submitState.message}
            </p>
          </div>
        </form>

        <div className="mt-4">
          <a
            className="text-[0.95rem] text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Prefer your email app instead?
          </a>
        </div>
      </div>
    </div>
  );
}

function PortfolioProjectViewer({ project }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [screenIndex, setScreenIndex] = useState(0);
  const [displayedScreenIndex, setDisplayedScreenIndex] = useState(0);
  const [screenTransition, setScreenTransition] = useState('idle');
  const [screenDirection, setScreenDirection] = useState('next');
  const preloadedScreensRef = useRef(new Set());
  const currentScreen = project.screens[displayedScreenIndex];

  useEffect(() => {
    setScreenIndex(0);
    setDisplayedScreenIndex(0);
    setScreenTransition('idle');
  }, [project.slug]);

  useEffect(() => {
    if (screenIndex === displayedScreenIndex) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setDisplayedScreenIndex(screenIndex);
      setScreenTransition('idle');
      return undefined;
    }

    setScreenTransition('exit');

    const swapTimer = window.setTimeout(() => {
      setDisplayedScreenIndex(screenIndex);
      setScreenTransition('enter');
    }, 240);

    const finishTimer = window.setTimeout(() => {
      setScreenTransition('idle');
    }, 560);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(finishTimer);
    };
  }, [displayedScreenIndex, prefersReducedMotion, screenIndex]);

  useEffect(() => {
    if (typeof Image === 'undefined') {
      return undefined;
    }

    const adjacentScreenSources = [
      project.screens[displayedScreenIndex - 1],
      project.screens[displayedScreenIndex + 1],
    ]
      .filter(Boolean)
      .map((screen) => screen.src)
      .filter((src) => src && !preloadedScreensRef.current.has(src));

    if (!adjacentScreenSources.length) {
      return undefined;
    }

    let cancelled = false;
    let idleCallbackId;
    let timeoutId;

    const preloadScreens = () => {
      if (cancelled) {
        return;
      }

      adjacentScreenSources.forEach((src) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
        preloadedScreensRef.current.add(src);
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(preloadScreens, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(preloadScreens, 240);
    }

    return () => {
      cancelled = true;

      if (typeof window !== 'undefined' && idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [displayedScreenIndex, project.screens]);

  function handleScreenChange(nextIndex) {
    if (
      nextIndex < 0 ||
      nextIndex >= project.screens.length ||
      nextIndex === screenIndex
    ) {
      return;
    }

    setScreenDirection(nextIndex > screenIndex ? 'next' : 'previous');
    setScreenIndex(nextIndex);
  }

  return (
    <div
      className="portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden px-14 py-12 max-[980px]:min-h-[55vh] max-[980px]:px-6"
      style={{ backgroundColor: project.accentColor }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(21,22,25,0.12)_0.9px,transparent_0.9px)] bg-[size:6px_6px] opacity-18" />
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className={`portfolio-screen-frame max-w-[min(76%,820px)] overflow-hidden rounded-[24px] bg-white/35 shadow-[0_26px_60px_rgba(15,18,25,0.18)] backdrop-blur-[2px] max-[980px]:max-w-[88%] ${
            screenTransition === 'exit'
              ? screenDirection === 'next'
                ? 'portfolio-screen-exit-next'
                : 'portfolio-screen-exit-previous'
              : ''
          } ${
            screenTransition === 'enter'
              ? screenDirection === 'next'
                ? 'portfolio-screen-enter-next'
                : 'portfolio-screen-enter-previous'
              : ''
          }`}
          key={`${project.slug}-${displayedScreenIndex}`}
        >
          <SafeImage
            alt={currentScreen.alt}
            className="max-h-[72vh] w-full object-contain"
            fetchPriority="high"
            loading="eager"
            fallbackClassName="h-[52vh] w-[min(76vw,760px)] rounded-[24px]"
            fallbackLabel={project.name}
            src={currentScreen.src}
          />
        </div>
      </div>

      <div className="absolute bottom-[4%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full bg-white/85 px-4 py-3 text-[0.92rem] shadow-[0_18px_40px_rgba(18,20,24,0.16)] backdrop-blur-sm">
        <button
          className={`rounded-full px-3 py-2 transition-colors ${screenIndex === 0 ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-100'}`}
          disabled={screenIndex === 0}
          onClick={() => handleScreenChange(screenIndex - 1)}
          type="button"
        >
          Previous
        </button>
        <span className="min-w-22 text-center font-medium text-slate-700">
          {screenIndex + 1} / {project.screens.length}
        </span>
        <button
          className={`rounded-full px-3 py-2 transition-colors ${screenIndex === project.screens.length - 1 ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-100'}`}
          disabled={screenIndex === project.screens.length - 1}
          onClick={() => handleScreenChange(screenIndex + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LegacyProjectRedirect() {
  const { slug } = useParams();

  if (!slug) {
    return <Navigate replace to={PORTFOLIO_HOME_PATH} />;
  }

  return <Navigate replace to={getProjectPath(slug)} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to={PORTFOLIO_HOME_PATH} />} path="/about" />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={LEGACY_DESIGN_ONE_PATH}
      />
      <Route
        element={<LegacyProjectRedirect />}
        path={`${LEGACY_DESIGN_ONE_PATH}/projects/:slug`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={LEGACY_DESIGN_TWO_PATH}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={`${LEGACY_DESIGN_TWO_PATH}/about`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_CONTACT_PATH} />}
        path={`${LEGACY_DESIGN_TWO_PATH}/contact`}
      />
      <Route
        element={<LegacyProjectRedirect />}
        path={`${LEGACY_DESIGN_TWO_PATH}/projects/:slug`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path="/designs/editorial-split"
      />
      <Route
        element={<LegacyProjectRedirect />}
        path="/designs/editorial-split/projects/:slug"
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path="/work.html"
      />
      <Route element={<PortfolioLayout />} path="*" />
    </Routes>
  );
}
