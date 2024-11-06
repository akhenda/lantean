import { createStore } from 'zustand';

export type DragonBallsState = { collected: number; usable?: boolean };
export type DragonBallsActions = { actions: { lose: () => void; collect: () => void } };
export type DragonBallsStore = DragonBallsState & DragonBallsActions;

export const defaultInitState: DragonBallsState = { collected: 0, usable: true };

export const createDragonBallsStore = (initState: DragonBallsState = defaultInitState) => {
  return createStore<DragonBallsStore>((set) => ({
    ...initState,
    actions: {
      lose: () => set((state) => ({ collected: state.collected > 1 ? state.collected - 1 : state.collected })),
      collect: () => set((state) => ({ collected: state.collected < 7 ? state.collected + 1 : state.collected })),
    },
  }));
};
