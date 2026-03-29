import { renderToString } from 'react-dom/server';
import { PortfolioRoutes } from './App';
import { StaticRouter } from './router-dom';

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <PortfolioRoutes />
    </StaticRouter>
  );
}
