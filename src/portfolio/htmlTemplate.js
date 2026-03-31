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
  { canonicalUrl, description, imageUrl, jsonLd, ogType, robots, title }
) {
  return template
    .replaceAll('__PORTFOLIO_CANONICAL_URL__', escapeHtml(canonicalUrl))
    .replaceAll('__PORTFOLIO_DESCRIPTION__', escapeHtml(description))
    .replaceAll('__PORTFOLIO_IMAGE_URL__', escapeHtml(imageUrl))
    .replaceAll('__PORTFOLIO_JSONLD__', serializeJsonLd(jsonLd))
    .replaceAll('__PORTFOLIO_OG_TYPE__', escapeHtml(ogType))
    .replaceAll('__PORTFOLIO_ROBOTS__', escapeHtml(robots))
    .replaceAll('__PORTFOLIO_TITLE__', escapeHtml(title));
}
