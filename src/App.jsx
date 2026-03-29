import { PortfolioLayout } from './components/portfolio/PortfolioLayout';
import {
  LEGACY_DESIGN_ONE_PATH,
  LEGACY_DESIGN_TWO_PATH,
  PORTFOLIO_CONTACT_PATH,
  PORTFOLIO_HOME_PATH,
} from './portfolio/constants';
import { getProjectPath } from './portfolio/routes';
import { Navigate, Route, Routes, useParams } from './router-dom';

function LegacyProjectRedirect() {
  const { slug } = useParams();

  if (!slug) {
    return <Navigate replace to={PORTFOLIO_HOME_PATH} />;
  }

  return <Navigate replace to={getProjectPath(slug)} />;
}

export function PortfolioRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to={PORTFOLIO_HOME_PATH} />} path="/about" />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={LEGACY_DESIGN_ONE_PATH}
      />
      <Route
        element={<LegacyProjectRedirect />}
        path={`${LEGACY_DESIGN_ONE_PATH}/projects/:slug`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={LEGACY_DESIGN_TWO_PATH}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path={`${LEGACY_DESIGN_TWO_PATH}/about`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_CONTACT_PATH} />}
        path={`${LEGACY_DESIGN_TWO_PATH}/contact`}
      />
      <Route
        element={<LegacyProjectRedirect />}
        path={`${LEGACY_DESIGN_TWO_PATH}/projects/:slug`}
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path="/designs/editorial-split"
      />
      <Route
        element={<LegacyProjectRedirect />}
        path="/designs/editorial-split/projects/:slug"
      />
      <Route
        element={<Navigate replace to={PORTFOLIO_HOME_PATH} />}
        path="/work.html"
      />
      <Route element={<PortfolioLayout />} path="*" />
    </Routes>
  );
}

export default function App() {
  return <PortfolioRoutes />;
}
