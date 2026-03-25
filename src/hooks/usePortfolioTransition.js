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
  const [displayedRoute, setDisplayedRoute] = useState(actualRoute);
  const [transitionState, setTransitionState] = useState('idle');
  const [overviewGridMotion, setOverviewGridMotion] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);

  useEffect(() => {
    if (actualRoute.type === 'missing' || actualRoute.key === displayedRoute.key) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setDisplayedRoute(actualRoute);
      setTransitionState('idle');
      setOverviewGridMotion(null);
      setPendingRoute(null);
      return undefined;
    }

    setPendingRoute(actualRoute);
    setTransitionState('exit');

    return undefined;
  }, [actualRoute, displayedRoute.key, prefersReducedMotion]);

  const handleStageAnimationEnd = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || prefersReducedMotion) {
        return;
      }

      if (transitionState === 'exit' && pendingRoute) {
        const nextState = advancePortfolioTransition({
          displayedRoute,
          pendingRoute,
          transitionState,
        });

        setOverviewGridMotion(nextState.overviewGridMotion);
        setDisplayedRoute(nextState.displayedRoute);
        setTransitionState(nextState.transitionState);
        return;
      }

      if (transitionState === 'enter') {
        const nextState = advancePortfolioTransition({
          displayedRoute,
          pendingRoute,
          transitionState,
        });

        setTransitionState(nextState.transitionState);
        setOverviewGridMotion(nextState.overviewGridMotion);
        setPendingRoute(nextState.pendingRoute);
      }
    },
    [displayedRoute.type, pendingRoute, prefersReducedMotion, transitionState]
  );

  return {
    displayedRoute,
    handleStageAnimationEnd,
    overviewGridMotion,
    transitionState,
  };
}
