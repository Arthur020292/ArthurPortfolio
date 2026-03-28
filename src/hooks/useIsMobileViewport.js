import { useEffect, useState } from 'react';

const MOBILE_VIEWPORT_QUERY = '(max-width: 980px)';

function getMobileViewportMatch() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

export function useIsMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(getMobileViewportMatch);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const handleChange = () => setIsMobileViewport(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobileViewport;
}
