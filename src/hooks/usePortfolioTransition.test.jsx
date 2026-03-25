import { advancePortfolioTransition, createOverviewGridMotion } from './usePortfolioTransition';

describe('usePortfolioTransition state helpers', () => {
  it('creates overview grid motion only for overview-to-overview hops', () => {
    expect(createOverviewGridMotion('about', 'projects', 12345)).toEqual({
      from: 'about',
      to: 'projects',
      token: 'about-projects-12345',
    });

    expect(createOverviewGridMotion('project', 'contact', 12345)).toBeNull();
  });

  it('moves from exit to enter with the pending route and then settles to idle', () => {
    const aboutRoute = { key: 'about', type: 'about' };
    const projectsRoute = { key: 'projects', type: 'projects' };

    const enterState = advancePortfolioTransition({
      displayedRoute: aboutRoute,
      pendingRoute: projectsRoute,
      transitionState: 'exit',
    });

    expect(enterState.displayedRoute).toEqual(projectsRoute);
    expect(enterState.transitionState).toBe('enter');
    expect(enterState.overviewGridMotion).toMatchObject({
      from: 'about',
      to: 'projects',
    });

    const idleState = advancePortfolioTransition({
      displayedRoute: enterState.displayedRoute,
      pendingRoute: enterState.pendingRoute,
      transitionState: enterState.transitionState,
    });

    expect(idleState.displayedRoute).toEqual(projectsRoute);
    expect(idleState.transitionState).toBe('idle');
    expect(idleState.overviewGridMotion).toBeNull();
    expect(idleState.pendingRoute).toBeNull();
  });
});
