import { useFlagsmith } from 'react-native-flagsmith/react';

import { FlagOptions } from '../types';

export const useGetFlagValueSync = () => {
  const flagsmith = useFlagsmith();
  const getFlagValueSync = (flagKey: FlagOptions) => flagsmith.getValue(flagKey);

  return { getFlagValueSync };
};
