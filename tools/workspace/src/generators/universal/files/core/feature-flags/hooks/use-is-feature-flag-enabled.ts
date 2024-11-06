import { useGetFeatureFlag } from './use-get-feature-flag';

import { FlagOptions } from '../types';

export function useIsFeatureFlagEnabled(flagKey: FlagOptions) {
  const flag = useGetFeatureFlag(flagKey);

  return flag.enabled;
}
