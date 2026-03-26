import { useEffect, useRef, useState } from 'react';
import { PortfolioContactFooterCtaSection } from './PortfolioContactFooterCta';
import { SafeImage } from './SafeImage';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PortfolioProjectRouteNav } from './copy/PortfolioProjectDetails';

function hexToRgb(hexColor) {
  if (!hexColor?.startsWith('#')) {
    return null;
  }

  const normalized =
    hexColor.length === 4
      ? `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`
      : hexColor;
  const int = Number.parseInt(normalized.slice(1), 16);

  if (Number.isNaN(int)) {
    return null;
  }

  return {
    b: int & 255,
    g: (int >> 8) & 255,
    r: (int >> 16) & 255,
  };
}

export function PortfolioProjectViewer({ project }) {
  const isMobileViewport = useIsMobileViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  const disableScreenTransitions = prefersReducedMotion || isMobileViewport;
  const [screenIndex, setScreenIndex] = useState(0);
  const [displayedScreenIndex, setDisplayedScreenIndex] = useState(0);
  const [screenTransition, setScreenTransition] = useState('idle');
  const [screenDirection, setScreenDirection] = useState('next');
  const preloadedScreensRef = useRef(new Set());
  const thumbnailStripRef = useRef(null);
  const touchStartRef = useRef(null);
  const currentScreen = project.screens[displayedScreenIndex];
  const isLongformScreen = currentScreen.display === 'longform';
  const accentRgb = hexToRgb(project.accentColor) || { r: 126, g: 182, b: 199 };

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

  useEffect(() => {
    const activeThumbnail = thumbnailStripRef.current?.querySelector(
      `[data-screen-index="${screenIndex}"]`
    );

    activeThumbnail?.scrollIntoView({
      behavior: disableScreenTransitions ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [disableScreenTransitions, screenIndex]);

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
        className="portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden px-14 py-12 max-[980px]:min-h-[55vh] max-[980px]:px-5 max-[640px]:min-h-0 max-[640px]:px-4 max-[640px]:py-7"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)), linear-gradient(135deg, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.86) 0%, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.72) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] bg-[size:8px_8px] opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08)_36%,rgba(15,23,42,0.05)_100%)]" />
        <div className="relative z-10 flex w-full max-w-[min(92vw,1080px)] flex-col items-center gap-5 max-[640px]:gap-4">
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
            <div className="mx-auto w-full overflow-hidden rounded-[22px] border border-white/45 bg-[rgba(255,255,255,0.24)] p-3 shadow-[0_26px_60px_rgba(15,18,25,0.18)] backdrop-blur-[6px] max-[980px]:max-w-[min(90vw,860px)] max-[640px]:rounded-[16px] max-[640px]:p-2">
              {isLongformScreen ? (
                <div className="h-[62vh] overflow-y-auto rounded-[14px] bg-white max-[1200px]:h-[57vh] max-[980px]:h-[44vh] max-[640px]:h-[38vh] max-[640px]:rounded-[12px]">
                  <SafeImage
                    alt={currentScreen.alt}
                    className="w-full rounded-[14px] bg-white align-top max-[640px]:rounded-[12px]"
                    fallbackClassName="h-[62vh] w-full rounded-[14px] max-[1200px]:h-[57vh] max-[980px]:h-[44vh] max-[640px]:h-[38vh] max-[640px]:rounded-[12px]"
                    fallbackLabel={project.name}
                    fetchPriority="high"
                    loading="eager"
                    src={currentScreen.src}
                  />
                </div>
              ) : (
                <SafeImage
                  alt={currentScreen.alt}
                  className="h-[62vh] w-full rounded-[14px] bg-white object-contain max-[1200px]:h-[57vh] max-[980px]:h-[44vh] max-[640px]:h-[38vh] max-[640px]:rounded-[12px]"
                  fallbackClassName="h-[62vh] w-full rounded-[14px] max-[1200px]:h-[57vh] max-[980px]:h-[44vh] max-[640px]:h-[38vh] max-[640px]:rounded-[12px]"
                  fallbackLabel={project.name}
                  fetchPriority="high"
                  loading="eager"
                  src={currentScreen.src}
                />
              )}
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-4 rounded-[18px] border border-white/45 bg-[rgba(255,255,255,0.86)] px-5 py-4 shadow-[0_18px_44px_rgba(18,20,24,0.14)] backdrop-blur-md max-[640px]:rounded-[14px] max-[640px]:px-4 max-[640px]:py-3">
            <div className="min-w-0 flex-1 max-[640px]:hidden">
              <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
                Screen {screenIndex + 1}
              </p>
              <p className="mt-1 truncate text-[0.98rem] font-medium text-slate-800 max-[640px]:text-[0.92rem]">
                {currentScreen.alt}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end max-[640px]:w-full max-[640px]:justify-between max-[640px]:self-auto">
              <button
                className={`rounded-full border px-3.5 py-2 text-[0.88rem] font-medium transition-colors ${
                  screenIndex === 0
                    ? 'cursor-not-allowed border-slate-200 text-slate-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                disabled={screenIndex === 0}
                onClick={() => handleScreenChange(screenIndex - 1)}
                type="button"
              >
                Previous
              </button>
              <span className="min-w-16 text-center text-[0.86rem] font-semibold text-slate-600">
                {screenIndex + 1} / {project.screens.length}
              </span>
              <button
                className={`rounded-full border px-3.5 py-2 text-[0.88rem] font-medium transition-colors ${
                  screenIndex === project.screens.length - 1
                    ? 'cursor-not-allowed border-slate-200 text-slate-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                disabled={screenIndex === project.screens.length - 1}
                onClick={() => handleScreenChange(screenIndex + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          {project.screens.length > 1 ? (
            <div
              className="flex w-full gap-3 overflow-x-auto pb-1"
              ref={thumbnailStripRef}
            >
              {project.screens.map((screen, index) => (
                <button
                  className={`group relative shrink-0 overflow-hidden rounded-[14px] border bg-white/80 transition-all ${
                    index === screenIndex
                      ? 'border-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.16)]'
                      : 'border-white/45 hover:border-slate-300'
                  }`}
                  data-screen-index={index}
                  key={screen.src}
                  onClick={() => handleScreenChange(index)}
                  type="button"
                >
                  <img
                    alt={screen.alt}
                    className="h-20 w-32 object-cover max-[640px]:h-16 max-[640px]:w-24"
                    loading="lazy"
                    src={screen.src}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 transition-colors ${
                      index === screenIndex
                        ? 'bg-transparent'
                        : 'bg-slate-900/10 group-hover:bg-slate-900/0'
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hidden border-t border-slate-200/80 bg-[rgba(250,250,250,0.96)] px-4 py-5 shadow-[0_-10px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm max-[640px]:block">
        <PortfolioProjectRouteNav project={project} />
      </div>
      <PortfolioContactFooterCtaSection className="hidden max-[640px]:block" />
    </>
  );
}
