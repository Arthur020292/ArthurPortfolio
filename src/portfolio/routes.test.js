import { getProjectPath, parsePortfolioRoute } from './routes';

describe('portfolio routes', () => {
  it('resolves the projects index route', () => {
    expect(parsePortfolioRoute('/projects/')).toEqual({
      key: 'projects',
      type: 'projects',
    });
  });

  it('normalizes slashless overview routes', () => {
    expect(parsePortfolioRoute('/projects')).toEqual({
      key: 'projects',
      type: 'projects',
    });

    expect(parsePortfolioRoute('/contact')).toEqual({
      key: 'contact',
      type: 'contact',
    });
  });

  it('resolves a known project route', () => {
    const route = parsePortfolioRoute('/projects/zip/');

    expect(route.type).toBe('project');
    expect(route.project?.slug).toBe('zip');
  });

  it('normalizes slashless project routes', () => {
    const route = parsePortfolioRoute('/projects/zip');

    expect(route.type).toBe('project');
    expect(route.project?.slug).toBe('zip');
  });

  it('builds project paths consistently', () => {
    expect(getProjectPath('zip')).toBe('/projects/zip/');
  });
});
