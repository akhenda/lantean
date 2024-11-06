import { usePathname } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { Analytics } from '@latean/analytics';

import { convertStringToKebabCase } from '../../utils/strings';

export const useAppScreenTracking = () => {
  const pathname = usePathname();

  const getScreenTrackedEventName = useCallback(() => {
    if (pathname === '/') return 'home-screen-viewed' as 'XXX-screen-viewed';
    else if (pathname.includes('/dragon-balls')) return 'dragon-balls-screen-viewed' as 'XXX-screen-viewed';
    // Add other specific tracking events for screens that need it

    const pathNameWithoutSlash = pathname.replace('/', '').replaceAll('/', '>');

    return `${convertStringToKebabCase(pathNameWithoutSlash)}-screen-viewed` as 'XXX-screen-viewed';
  }, [pathname]);

  useEffect(() => {
    const eventName = getScreenTrackedEventName();

    Analytics.trackEvent(eventName);
  }, [getScreenTrackedEventName]);
};
