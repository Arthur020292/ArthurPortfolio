import { useCallback, useEffect, useState } from 'react';
import { isOverviewRoute } from '../portfolio/routes';

export function createOverviewGridMotion(fromType, toType, now = Date.now()) {
  if (!isOverviewRoute(fromType) || !isOverviewRoute(toType)) {
    return null;
  }

  return {
    from: fromType,
    to: toType,
    token: `${fromType}-${toType}-${now}`,
  };
}

export function advancePortfolioTransition({
  displayedRoute,
  pendingRoute,
  transitionState,
}) {
  if (transitionState === 'exit' && pendingRoute) {
    return {
      displayedRoute: pendingRoute,
      overviewGridMotion: createOverviewGridMotion(displayedRoute.type, pendingRoute.type),
      pendingRoute,
      transitionState: 'enter',
    };
  }

  if (transitionState === 'enter') {
    return {
      displayedRoute,
      overviewGridMotion: null,
      pendingRoute: null,
      transitionState: 'idle',
    };
  }

  return {
    displayedRoute,
    overviewGridMotion: null,
    pendingRoute,
    transitionState,
  };
}

export function usePortfolioTransition({ actualRoute, prefersReducedMotion }) {
  const [transition, setTransition] = useState({
    displayedRoute: actualRoute,
    overviewGridMotion: null,
    pendingRoute: null,
    transitionState: 'idle',
  });
  const { displayedRoute, overviewGridMotion, pendingRoute, transitionState } = transition;

  useEffect(() => {
    if (actualRoute.type === 'missing' || actualRoute.key === displayedRoute.key) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setTransition({
        displayedRoute: actualRoute,
        overviewGridMotion: null,
        pendingRoute: null,
        transitionState: 'idle',
      });
      return undefined;
    }

    setTransition((current) => ({
      ...current,
      pendingRoute: actualRoute,
      transitionState: 'exit',
    }));

    return undefined;
  }, [actualRoute, displayedRoute.key, prefersReducedMotion, setTransition]);

  const handleStageAnimationEnd = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || prefersReducedMotion) {
        return;
      }

      if (transitionState === 'exit' && pendingRoute) {
        setTransition((current) => advancePortfolioTransition(current));
        return;
      }

      if (transitionState === 'enter') {
        setTransition((current) => advancePortfolioTransition(current));
      }
    },
    [pendingRoute, prefersReducedMotion, transitionState]
  );

  return {
    displayedRoute,
    handleStageAnimationEnd,
    overviewGridMotion,
    transitionState,
  };
}
