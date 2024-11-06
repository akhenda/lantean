import { Analytics } from '@latean/analytics';

import { useAppState } from '../../hooks/use-app-state';

export const useAppStateTracking = () => {
  useAppState({
    onGoingToBackground: () => {
      Analytics.trackEvent('app-put-in-background');
    },
    onComingToForeground: () => {
      Analytics.trackEvent('app-put-in-foreground');
    },
  });
};
