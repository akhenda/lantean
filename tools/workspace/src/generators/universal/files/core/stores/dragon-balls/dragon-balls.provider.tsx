/**
 * https://tkdodo.eu/blog/zustand-and-react-context
 */
import { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';

import { createDragonBallsStore, DragonBallsState, DragonBallsStore } from './dragon-balls.store';

import { createSelectors } from '../utils';

const DragonBallsStoreContext = createContext<ReturnType<typeof createDragonBallsStore> | null>(null);

export const DragonBallsStoreProvider = ({ children, initialCollected }) => {
  const [store] = useState(createDragonBallsStore({ collected: initialCollected }));

  return <DragonBallsStoreContext.Provider value={store}>{children}</DragonBallsStoreContext.Provider>;
};

export function useDragonBallsStore<T>(selector: (state: DragonBallsState) => T) {
  const store = useContext(DragonBallsStoreContext);

  if (!store) throw new Error('Missing DragonBallsStoreProvider');

  return useStore(store, selector);
}

export const useUsable = () => useDragonBallsStore((state) => state.usable);
export const useCollected = () => useDragonBallsStore((state) => state.collected);

/**
 * Custom hook to access the DragonBalls store with auto-generated selectors.
 *
 * This hook retrieves the DragonBalls store from the context and applies the
 * `createSelectors` utility to generate selectors for accessing the store's
 * state values by their keys.
 *
 * @returns A store with auto-generated selectors for accessing state values.
 * @throws Will throw an error if used outside of a DragonBallsStoreProvider.
 */
export function useDragonBallsStoreWithSelectors() {
  const store = useContext(DragonBallsStoreContext);

  if (!store) throw new Error('Missing DragonBallsStoreProvider');

  return createSelectors(store);
}
