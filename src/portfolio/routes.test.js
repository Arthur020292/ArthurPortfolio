import { getProjectPath, parsePortfolioRoute } from './routes';

describe('portfolio routes', () => {
  it('resolves the projects index route', () => {
    expect(parsePortfolioRoute('/projects')).toEqual({
      key: 'projects',
      type: 'projects',
    });
  });

  it('resolves a known project route', () => {
    const route = parsePortfolioRoute('/projects/zip');

    expect(route.type).toBe('project');
    expect(route.project?.slug).toBe('zip');
  });

  it('builds project paths consistently', () => {
    expect(getProjectPath('zip')).toBe('/projects/zip');
  });
});
