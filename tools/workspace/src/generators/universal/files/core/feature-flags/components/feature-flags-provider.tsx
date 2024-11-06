import { osVersion } from 'expo-device';
import type { ReactElement } from 'react';
import flagsmith from 'react-native-flagsmith';
import { FlagsmithProvider } from 'react-native-flagsmith/react';
import type { IFlagsmith } from 'react-native-flagsmith/types';

import { defaultFlags } from '../default-flags';
import featureFlagStorage from '../../storage/items/feature-flag';
import { isIos } from '../../utils/platform';
import { config } from '../../constants/configs/expo';

const FIFTEEN_MINUTES_IN_MS = 900_000;
const cacheOptions = { skipAPI: true, ttl: FIFTEEN_MINUTES_IN_MS };

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const options: Parameters<IFlagsmith['init']>[0] = {
  environmentID: config.flagsmithKey,
  cacheFlags: true,
  AsyncStorage: featureFlagStorage,
  cacheOptions,
  defaultFlags,

  // TODO(prod): add proper user identity and traits
  identity: 'user-123',
  traits: {
    'user-trait-1': 'value-1',
    'user-trait-2': 2,
    'user-trait-3': true,
    'os-name': isIos ? 'iOS' : 'Android',
    'os-version': osVersion,
    'app-version': config.version || 'Not set',
  },
};

export const FeatureFlagsProvider = ({ children }: { children: ReactElement }) => {
  return (
    <FlagsmithProvider
      flagsmith={flagsmith}
      options={{
        ...(options as Record<string, unknown>),
        onChange: (_, { isFromServer }) => {
          if (!isFromServer) {
            // Flags are coming from the cache
            // Decide here if we want to force fetch new flags
          }
        },
      }}
    >
      {children}
    </FlagsmithProvider>
  );
};
