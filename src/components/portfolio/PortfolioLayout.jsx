import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortfolioHeader } from './PortfolioHeader';
import { PortfolioLeftContent } from './PortfolioCopy';
import { PortfolioProjectGrid } from './PortfolioProjectGrid';
import { PortfolioContactPanel } from './PortfolioContactPanel';
import { PortfolioProjectViewer } from './PortfolioProjectViewer';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { usePortfolioTransition } from '../../hooks/usePortfolioTransition';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE_PATH,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
  PORTFOLIO_PROJECTS_PATH,
} from '../../portfolio/constants';
import { getProjectPath, isOverviewRoute, parsePortfolioRoute } from '../../portfolio/routes';

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
  const isMobileViewport = useIsMobileViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const disablePortfolioTransitions = prefersReducedMotion || isMobileViewport;
  const leftPanelRef = useRef(null);
  const mainContentRef = useRef(null);
  const rightPanelRef = useRef(null);
  const previousPathRef = useRef(location.pathname);
  const lastLeftScrollRef = useRef(0);
  const [showStickyNav, setShowStickyNav] = useState(false);
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

  useEffect(() => {
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

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    window.scrollTo({ top: 0 });
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
      <div className="sticky top-0 z-40 hidden border-b border-[#ece7df] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.94))] px-5 py-3 backdrop-blur-sm max-[980px]:block max-[640px]:px-4">
        <PortfolioHeader activeRoute={actualRoute.type} />
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
                <PortfolioHeader activeRoute={actualRoute.type} />
              </div>
            </div>
            <div className="relative z-30 max-[980px]:hidden">
              <PortfolioHeader activeRoute={actualRoute.type} />
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
