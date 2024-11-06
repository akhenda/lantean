import type { ReactNode } from 'react';

import { FlagOptions } from '../types';
import { useIsFeatureFlagEnabled } from '../hooks/use-is-feature-flag-enabled';

type FeatureFlagSplitterProps = {
  children?: ReactNode;
  ifOn?: ReactNode;
  ifOff?: ReactNode;
  flagKey: FlagOptions;
};

export default function FeatureFlagSplitter({
  children = null,
  ifOn = null,
  ifOff = null,
  flagKey,
}: FeatureFlagSplitterProps) {
  const isEnabled = useIsFeatureFlagEnabled(flagKey);

  if (isEnabled) return children ?? ifOn;

  return ifOff;
}
