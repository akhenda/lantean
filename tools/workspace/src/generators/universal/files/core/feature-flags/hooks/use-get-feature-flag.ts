import { useFlags } from 'react-native-flagsmith/react';

import { FlagOptions, TraitOptions } from '../types';

export function useGetFeatureFlag(flagKey: FlagOptions) {
  const flag = useFlags<FlagOptions, TraitOptions>([flagKey])[flagKey];

  return flag;
}
