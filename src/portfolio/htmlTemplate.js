export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function serializeJsonLd(data) {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

export function replacePortfolioTemplate(
  template,
  { canonicalUrl, description, imageUrl, jsonLd, title }
) {
  return template
    .replaceAll('__PORTFOLIO_CANONICAL_URL__', escapeHtml(canonicalUrl))
    .replaceAll('__PORTFOLIO_DESCRIPTION__', escapeHtml(description))
    .replaceAll('__PORTFOLIO_IMAGE_URL__', escapeHtml(imageUrl))
    .replaceAll('__PORTFOLIO_JSONLD__', serializeJsonLd(jsonLd))
    .replaceAll('__PORTFOLIO_TITLE__', escapeHtml(title));
}
