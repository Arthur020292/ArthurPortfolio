import { useEffect } from 'react';
import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE_PATH,
  PORTFOLIO_HOME_PATH,
  SITE_NAME,
} from '../portfolio/constants';
import {
  buildPortfolioStructuredData,
  resolveSiteUrl,
  toAbsoluteUrl,
} from '../portfolio/seo';

const SITE_URL = resolveSiteUrl(
  import.meta.env.VITE_SITE_URL,
  typeof window !== 'undefined' ? window.location.origin : ''
);

function setMetaTag({ content, name, property }) {
  if (!content) {
    return;
  }

  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');

    if (name) {
      element.setAttribute('name', name);
    }

    if (property) {
      element.setAttribute('property', property);
    }

    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setCanonicalLink(href) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setStructuredData(data) {
  let script = document.head.querySelector('script[data-portfolio-schema="true"]');

  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-portfolio-schema', 'true');
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function useDocumentMeta({
  description = DEFAULT_META_DESCRIPTION,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  path = PORTFOLIO_HOME_PATH,
  title,
  type = 'website',
}) {
  useEffect(() => {
    document.title = title;

    const canonicalUrl = toAbsoluteUrl(path, SITE_URL);
    const imageUrl = toAbsoluteUrl(imagePath, SITE_URL);
    const structuredData = buildPortfolioStructuredData(
      { description, imagePath, path, title, type },
      SITE_URL
    );

    setMetaTag({ name: 'description', content: description });
    setMetaTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });
    setMetaTag({ property: 'og:site_name', content: SITE_NAME });
    setMetaTag({ property: 'og:title', content: title });
    setMetaTag({ property: 'og:description', content: description });
    setMetaTag({ property: 'og:type', content: type });
    setMetaTag({ property: 'og:url', content: canonicalUrl || path });
    setMetaTag({ property: 'og:image', content: imageUrl || imagePath });
    setMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
    setMetaTag({ name: 'twitter:title', content: title });
    setMetaTag({ name: 'twitter:description', content: description });
    setMetaTag({ name: 'twitter:image', content: imageUrl || imagePath });

    if (canonicalUrl) {
      setCanonicalLink(canonicalUrl);
    }

    setStructuredData(structuredData);
  }, [description, imagePath, path, title, type]);
}
