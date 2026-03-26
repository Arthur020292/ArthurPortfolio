import { useEffect, useRef, useState } from 'react';
import { PortfolioContactFooterCtaSection } from './PortfolioContactFooterCta';
import { SafeImage } from './SafeImage';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PortfolioProjectRouteNav } from './copy/PortfolioProjectDetails';

export function PortfolioProjectViewer({ project }) {
  const isMobileViewport = useIsMobileViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const disableScreenTransitions = prefersReducedMotion || isMobileViewport;
  const [screenIndex, setScreenIndex] = useState(0);
  const [displayedScreenIndex, setDisplayedScreenIndex] = useState(0);
  const [screenTransition, setScreenTransition] = useState('idle');
  const [screenDirection, setScreenDirection] = useState('next');
  const preloadedScreensRef = useRef(new Set());
  const touchStartRef = useRef(null);
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

    if (disableScreenTransitions) {
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
  }, [disableScreenTransitions, displayedScreenIndex, screenIndex]);

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

  function handleTouchStart(event) {
    if (!isMobileViewport) {
      return;
    }

    const touch = event.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event) {
    if (!isMobileViewport || !touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    touchStartRef.current = null;

    if (absDeltaX < 48 || absDeltaX <= absDeltaY * 1.2) {
      return;
    }

    if (deltaX < 0) {
      handleScreenChange(screenIndex + 1);
      return;
    }

    handleScreenChange(screenIndex - 1);
  }

  return (
    <>
      <div
        className="portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden px-14 py-12 max-[980px]:min-h-[55vh] max-[980px]:px-5 max-[640px]:min-h-0 max-[640px]:px-4 max-[640px]:py-8"
        style={{ backgroundColor: project.accentColor }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(21,22,25,0.12)_0.9px,transparent_0.9px)] bg-[size:6px_6px] opacity-18" />
        <div className="relative flex h-full w-full items-center justify-center">
          <div
            className={`portfolio-screen-frame flex w-full touch-pan-y items-center justify-center ${
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
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
            key={`${project.slug}-${displayedScreenIndex}`}
          >
            <div className="mx-auto w-full max-w-[min(88vw,980px)] overflow-hidden rounded-[12px] border border-white/30 bg-white/24 shadow-[0_22px_48px_rgba(15,18,25,0.16)] max-[640px]:rounded-[10px]">
              <SafeImage
                alt={currentScreen.alt}
                className="max-h-[72vh] w-full object-contain max-[980px]:max-h-[46vh] max-[640px]:max-h-[42vh]"
                fallbackClassName="h-[52vh] w-full rounded-[12px] max-[640px]:rounded-[10px]"
                fallbackLabel={project.name}
                fetchPriority="high"
                loading="eager"
                src={currentScreen.src}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-[4%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full bg-white/85 px-4 py-3 text-[0.92rem] shadow-[0_18px_40px_rgba(18,20,24,0.16)] backdrop-blur-sm max-[640px]:bottom-[3%] max-[640px]:gap-2 max-[640px]:px-3 max-[640px]:py-2 max-[640px]:text-[0.82rem]">
          <button
            className={`rounded-full px-3 py-2 transition-colors ${
              screenIndex === 0 ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-100'
            }`}
            disabled={screenIndex === 0}
            onClick={() => handleScreenChange(screenIndex - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="min-w-22 text-center font-medium text-slate-700 max-[640px]:min-w-16">
            {screenIndex + 1} / {project.screens.length}
          </span>
          <button
            className={`rounded-full px-3 py-2 transition-colors ${
              screenIndex === project.screens.length - 1
                ? 'cursor-not-allowed text-slate-300'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            disabled={screenIndex === project.screens.length - 1}
            onClick={() => handleScreenChange(screenIndex + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <div className="hidden border-t border-slate-200/80 bg-[rgba(250,250,250,0.96)] px-4 py-5 shadow-[0_-10px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm max-[640px]:block">
        <PortfolioProjectRouteNav project={project} />
      </div>
      <PortfolioContactFooterCtaSection className="hidden max-[640px]:block" />
    </>
  );
}
