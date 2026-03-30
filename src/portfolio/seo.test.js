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
      '/projects/',
      '/contact/',
      '/projects/mrioa/',
      '/projects/contractsrx/',
      '/projects/chromedia/',
      '/projects/portlandpedalpower/',
      '/projects/chromedia-talent-intelligence/',
      '/projects/nlrp/',
      '/projects/spokehealth/',
      '/projects/zip/',
      '/projects/chronomedia/',
      '/projects/nester/',
      '/projects/harvest21/',
      '/projects/workrite/',
      '/projects/kidough/',
      '/projects/msp/',
    ]);
  });

  it('creates absolute urls from a site url', () => {
    expect(resolveSiteUrl('https://arthurbaduyen.dev/')).toBe('https://arthurbaduyen.dev');
    expect(toAbsoluteUrl('/contact/', 'https://arthurbaduyen.dev/')).toBe(
      'https://arthurbaduyen.dev/contact/'
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

    expect(meta.path).toBe('/projects/zip/');
    expect(structuredData['@type']).toBe('CreativeWork');
    expect(structuredData.url).toBe('https://arthurbaduyen.dev/projects/zip/');
  });

  it('creates noindex metadata for missing routes', () => {
    const meta = getPortfolioPageMeta({ key: 'missing', type: 'missing' });
    const structuredData = buildPortfolioStructuredData(meta, 'https://arthurbaduyen.dev');

    expect(meta.path).toBe('/404/');
    expect(meta.robots).toBe('noindex,follow');
    expect(meta.ogType).toBe('website');
    expect(structuredData['@graph'][2]['@type']).toBe('WebPage');
    expect(structuredData['@graph'][2].url).toBe('https://arthurbaduyen.dev/404/');
  });

  it('creates collection page schema for the projects index', () => {
    const meta = getPortfolioPageMeta({ key: 'projects', type: 'projects' });
    const structuredData = buildPortfolioStructuredData(meta, 'https://arthurbaduyen.dev');
    const collectionPage = structuredData['@graph'][2];
    const firstItem = collectionPage.mainEntity.itemListElement[0];

    expect(meta.path).toBe('/projects/');
    expect(meta.schemaType).toBe('CollectionPage');
    expect(collectionPage['@type']).toBe('CollectionPage');
    expect(collectionPage.url).toBe('https://arthurbaduyen.dev/projects/');
    expect(firstItem.url).toMatch(/^https:\/\/arthurbaduyen\.dev\/projects\/[^/]+\/$/);
  });
});
