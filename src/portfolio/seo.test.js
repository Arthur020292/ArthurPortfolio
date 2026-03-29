import { getProjectBySlug } from '../data';
import { getIndexableRoutes } from './routes';
import {
  buildPortfolioStructuredData,
  getPortfolioPageMeta,
  resolveSiteUrl,
  toAbsoluteUrl,
} from './seo';

describe('portfolio seo helpers', () => {
  it('builds the canonical route list', () => {
    expect(getIndexableRoutes()).toEqual([
      '/',
      '/projects',
      '/contact',
      '/projects/mrioa',
      '/projects/contractsrx',
      '/projects/chromedia',
      '/projects/portlandpedalpower',
      '/projects/chromedia-talent-intelligence',
      '/projects/nlrp',
      '/projects/spokehealth',
      '/projects/zip',
      '/projects/chronomedia',
      '/projects/nester',
      '/projects/harvest21',
      '/projects/workrite',
      '/projects/kidough',
      '/projects/msp',
    ]);
  });

  it('creates absolute urls from a site url', () => {
    expect(resolveSiteUrl('https://arthurbaduyen.dev/')).toBe('https://arthurbaduyen.dev');
    expect(toAbsoluteUrl('/contact', 'https://arthurbaduyen.dev/')).toBe(
      'https://arthurbaduyen.dev/contact'
    );
  });

  it('creates project metadata and structured data', () => {
    const route = {
      key: 'project:zip',
      project: getProjectBySlug('zip'),
      type: 'project',
    };
    const meta = getPortfolioPageMeta(route);
    const structuredData = buildPortfolioStructuredData(meta, 'https://arthurbaduyen.dev');

    expect(meta.path).toBe('/projects/zip');
    expect(structuredData['@type']).toBe('CreativeWork');
    expect(structuredData.url).toBe('https://arthurbaduyen.dev/projects/zip');
  });
});
