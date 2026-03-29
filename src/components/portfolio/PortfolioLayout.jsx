import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PortfolioHeader } from './PortfolioHeader';
import { PortfolioLeftContent } from './PortfolioCopy';
import { PortfolioProjectGrid } from './PortfolioProjectGrid';
import { PortfolioContactPanel } from './PortfolioContactPanel';
import { PortfolioProjectViewer } from './PortfolioProjectViewer';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { usePortfolioTransition } from '../../hooks/usePortfolioTransition';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PORTFOLIO_HOME_PATH } from '../../portfolio/constants';
import { isOverviewRoute, parsePortfolioRoute } from '../../portfolio/routes';
import { getPortfolioPageMeta } from '../../portfolio/seo';
import { Navigate, useLocation } from '../../router-dom';

function PortfolioRightContent({
  contactExitState,
  contactPanelTransitionState,
  overviewGridMotion,
  route,
}) {
  if (route.type === 'about') {
    return (
      <PortfolioProjectGrid
        contactExitState={contactExitState}
        mode="featured"
        overviewGridMotion={overviewGridMotion}
      />
    );
  }

  if (route.type === 'projects') {
    return (
      <PortfolioProjectGrid
        contactExitState={contactExitState}
        mode="all"
        overviewGridMotion={overviewGridMotion}
      />
    );
  }

  if (route.type === 'contact') {
    return <PortfolioContactPanel motionState={contactPanelTransitionState} />;
  }

  return <PortfolioProjectViewer project={route.project} />;
}

export function PortfolioLayout() {
  const location = useLocation();
  const actualRoute = useMemo(() => parsePortfolioRoute(location.pathname), [location.pathname]);
  const pageMeta = useMemo(() => getPortfolioPageMeta(actualRoute), [actualRoute]);
  const isMobileViewport = useIsMobileViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const disablePortfolioTransitions = prefersReducedMotion || isMobileViewport;
  const leftPanelRef = useRef(null);
  const mainContentRef = useRef(null);
  const rightPanelRef = useRef(null);
  const mobileBookCallCtaRef = useRef(null);
  const previousPathRef = useRef(location.pathname);
  const lastLeftScrollRef = useRef(0);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [showMobileBookCall, setShowMobileBookCall] = useState(
    !isMobileViewport || actualRoute.type !== 'about'
  );
  const { displayedRoute, handleStageAnimationEnd, overviewGridMotion, transitionState } =
    usePortfolioTransition({
      actualRoute,
      prefersReducedMotion: disablePortfolioTransitions,
    });
  const contactPanelTransitionState =
    displayedRoute.type === 'contact' && transitionState !== 'idle' ? transitionState : 'idle';
  const contactExitState = actualRoute.type === 'contact' && transitionState === 'exit';
  const contactTransitionActive =
    actualRoute.type === 'contact' || displayedRoute.type === 'contact';
  const mobileContactSinglePanel = displayedRoute.type === 'contact';
  const disableRightPanelTransition =
    (isOverviewRoute(actualRoute.type) && isOverviewRoute(displayedRoute.type)) ||
    contactTransitionActive;

  useEffect(() => {
    if (!isMobileViewport || actualRoute.type !== 'about') {
      setShowMobileBookCall(true);
      return undefined;
    }

    const ctaElement = mobileBookCallCtaRef.current;

    if (!ctaElement) {
      return undefined;
    }

    const revealBookCall = () => {
      setShowMobileBookCall(true);
    };

    const handleVisibility = () => {
      const rect = ctaElement.getBoundingClientRect();

      if (rect.top < 0) {
        revealBookCall();
      }
    };

    handleVisibility();

    if (showMobileBookCall) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      window.addEventListener('scroll', handleVisibility, { passive: true });
      window.addEventListener('resize', handleVisibility);

      return () => {
        window.removeEventListener('scroll', handleVisibility);
        window.removeEventListener('resize', handleVisibility);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          revealBookCall();
        }
      },
      { threshold: 0 }
    );

    observer.observe(ctaElement);

    return () => {
      observer.disconnect();
    };
  }, [actualRoute.type, isMobileViewport, showMobileBookCall]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return undefined;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useDocumentMeta(pageMeta);

  useLayoutEffect(() => {
    const panel = leftPanelRef.current;

    if (!panel) {
      return undefined;
    }

    const handleScroll = () => {
      const currentScrollTop = panel.scrollTop;
      const previousScrollTop = lastLeftScrollRef.current;
      const scrollDelta = currentScrollTop - previousScrollTop;
      const isScrollingUp = currentScrollTop < previousScrollTop;
      const crossedHideThreshold = currentScrollTop < 120;
      const crossedShowThreshold = currentScrollTop > 180;

      if (Math.abs(scrollDelta) < 8) {
        return;
      }

      setShowStickyNav((current) => {
        if (crossedHideThreshold) {
          return false;
        }

        if (isScrollingUp && crossedShowThreshold) {
          return true;
        }

        if (!isScrollingUp) {
          return false;
        }

        return current;
      });

      lastLeftScrollRef.current = currentScrollTop;
    };

    handleScroll();
    panel.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      panel.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const panel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;

    if (!panel) {
      return;
    }

    panel.scrollTo({ top: 0 });
    rightPanel?.scrollTo({ top: 0 });
    lastLeftScrollRef.current = panel.scrollTop;
    setShowStickyNav(false);
  }, [displayedRoute.key]);

  useLayoutEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    const body = document.body;
    const bodyWasLocked = body.style.position === 'fixed';
    const root = document.documentElement;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (!isMobileViewport) {
      mainContentRef.current?.focus({ preventScroll: true });
    }
    if (bodyWasLocked) {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    previousPathRef.current = location.pathname;

    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousRootScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
    });
  }, [location.pathname]);

  if (actualRoute.type === 'missing') {
    return <Navigate replace to={PORTFOLIO_HOME_PATH} />;
  }

  return (
    <>
      <a className="skip-link" href="#portfolio-main-content">
        Skip to main content
      </a>
      <div className="sticky top-0 z-40 hidden border-b border-[#ece7df] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.94))] px-5 py-3 backdrop-blur-sm max-[980px]:block max-[640px]:px-4">
        <PortfolioHeader
          activeRoute={actualRoute.type}
          showMobileBookCall={showMobileBookCall}
        />
      </div>
      <main
        className="min-h-dvh overflow-hidden bg-white max-[980px]:min-h-0"
        id="portfolio-main-content"
        ref={mainContentRef}
        tabIndex={-1}
      >
        <div className="relative grid min-h-dvh grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] overflow-hidden bg-white max-[980px]:min-h-0 max-[980px]:grid-cols-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[45%] z-20 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(223,218,210,0.35),rgba(223,218,210,0.8),rgba(223,218,210,0.35))] shadow-[0_0_18px_rgba(255,255,255,0.55)] max-[980px]:hidden"
          />
          <section
            aria-label="Portfolio details"
            className={`relative flex h-dvh min-h-dvh flex-col overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,250,0.98))] px-12 ${
              displayedRoute.type === 'project' ? 'pt-10 pb-0' : 'py-10'
            } max-[980px]:h-auto max-[980px]:min-h-0 max-[980px]:overflow-visible max-[980px]:border-b max-[980px]:border-[#ece7df] max-[980px]:px-5 ${
              displayedRoute.type === 'project'
                ? 'max-[980px]:pt-0 max-[980px]:pb-0'
                : 'max-[980px]:py-6'
            } max-[640px]:px-4 ${
              displayedRoute.type === 'project'
                ? 'max-[640px]:pt-0 max-[640px]:pb-0'
                : 'max-[640px]:py-5'
            } ${
              mobileContactSinglePanel
                ? 'max-[980px]:order-2 max-[980px]:hidden max-[980px]:border-b-0'
                : ''
            }`}
            ref={leftPanelRef}
          >
            <div
              aria-hidden={!showStickyNav}
              className={`portfolio-sticky-header sticky z-40 h-0 overflow-visible transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-[980px]:hidden ${
                showStickyNav
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-3 opacity-0'
              }`}
            >
              <div className="border-b border-slate-200/85 bg-[rgba(255,255,255,0.985)] px-12 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-md max-[980px]:-mx-5 max-[980px]:px-5 max-[980px]:py-3 max-[640px]:-mx-4 max-[640px]:px-4">
                <PortfolioHeader
                  activeRoute={actualRoute.type}
                  showMobileBookCall={showMobileBookCall}
                />
              </div>
            </div>
            <div className="relative z-30 max-[980px]:hidden">
              <PortfolioHeader
                activeRoute={actualRoute.type}
                showMobileBookCall={showMobileBookCall}
              />
            </div>
            <div
              className={`mt-10 flex-1 max-[980px]:mt-6 ${
                displayedRoute.type === 'project' ? 'max-[980px]:mb-4 max-[640px]:mb-3' : ''
              } ${
                transitionState === 'exit' ? 'portfolio-left-stage-exit' : ''
              } ${transitionState === 'enter' ? 'portfolio-left-stage-enter' : ''}`}
              key={displayedRoute.key}
              onAnimationEnd={handleStageAnimationEnd}
            >
              <PortfolioLeftContent
                mobileBookCallCtaRef={mobileBookCallCtaRef}
                route={displayedRoute}
                showMobileBookCall={showMobileBookCall}
              />
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
            className={`relative h-dvh min-h-dvh ${
              displayedRoute.type === 'about' || displayedRoute.type === 'projects'
                ? 'overflow-y-auto overflow-x-hidden bg-[#fbfaf7]'
                : 'overflow-hidden'
            } ${
              !disableRightPanelTransition && transitionState === 'exit'
                ? 'portfolio-right-stage-exit'
                : ''
            } ${
              !disableRightPanelTransition && transitionState === 'enter'
                ? 'portfolio-right-stage-enter'
                : ''
            } max-[980px]:h-auto max-[980px]:overflow-visible ${
              mobileContactSinglePanel
                ? 'max-[980px]:order-1'
                : ''
            }`}
            key={`${displayedRoute.key}-panel`}
            ref={rightPanelRef}
          >
            <PortfolioRightContent
              contactExitState={contactExitState}
              contactPanelTransitionState={contactPanelTransitionState}
              overviewGridMotion={overviewGridMotion}
              route={displayedRoute}
            />
          </section>
        </div>
      </main>
    </>
  );
}
