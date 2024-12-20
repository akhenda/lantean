import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';

type Props = {
  onChangeFound?: (data: {
    changesObj: Record<
      string,
      {
        from: unknown;
        to: unknown;
        isDeepEqual: boolean;
        changedKeys?: string[];
      }
    >;
  }) => void;
  onNoChangeFound?: () => void;
};

type ChangeObj = Record<
  string,
  { from: unknown; to: unknown; isDeepEqual: boolean; changedKeys?: string[] }
>;

const NO_OBJECTS = 0;

/**
 * Logs why a component rerendered. It takes a `name` for the component,
 * the `props` to check for changes, and an object with optional `onChangeFound`
 * and `onNoChangeFound` callbacks. If a change is detected, it will call
 * `onChangeFound` with an object containing the changes. If no change is detected,
 * it will call `onNoChangeFound` if it exists, otherwise it will log a message
 * to the console.
 */
export const useWhyDidYouUpdate = (
  name: string,
  props: Record<string, unknown>,
  { onChangeFound, onNoChangeFound }: Props = {},
) => {
  const latestProps = useRef(props);

  useEffect(() => {
    if (!__DEV__) return;

    const changesObj: ChangeObj = {};
    const allKeys = Object.keys({ ...latestProps.current, ...props });

    allKeys.forEach((key) => {
      if (latestProps.current[key] !== props[key]) {
        changesObj[key] = {
          from: latestProps.current[key],
          to: props[key],
          changedKeys:
            props[key] && typeof props[key] === 'object'
              ? // @ts-expect-error: can't properly type this
                Object.keys(latestProps.current[key])
                  .map((k) =>
                    // @ts-expect-error: can't properly type this
                    latestProps.current[key][k] === props[key][k] ? '' : k,
                  )
                  .filter(Boolean)
              : undefined,
          isDeepEqual: isEqual(latestProps.current[key], props[key]),
        };
      }
    });

    if (Object.keys(changesObj).length > NO_OBJECTS) {
      if (onChangeFound) {
        onChangeFound({ changesObj });
      } else {
        // eslint-disable-next-line no-console
        console.log('[why-did-you-update]', name, {
          props: { from: latestProps.current, to: props },
        });
      }
    } else if (onNoChangeFound) {
      onNoChangeFound();
    }

    latestProps.current = props;
  });
};
