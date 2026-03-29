import { PortfolioAboutContent } from './copy/PortfolioAboutContent';
import { PortfolioContactContent } from './copy/PortfolioContactContent';
import { PortfolioProjectDetails } from './copy/PortfolioProjectDetails';
import { PortfolioProjectsContent } from './copy/PortfolioProjectsContent';

export function PortfolioLeftContent({
  mobileBookCallCtaRef,
  route,
  showMobileBookCall,
}) {
  if (route.type === 'about') {
    return (
      <PortfolioAboutContent
        mobileBookCallCtaRef={mobileBookCallCtaRef}
        showMobileBookCall={showMobileBookCall}
      />
    );
  }

  if (route.type === 'projects') {
    return <PortfolioProjectsContent />;
  }

  if (route.type === 'contact') {
    return <PortfolioContactContent />;
  }

  return <PortfolioProjectDetails project={route.project} />;
}
