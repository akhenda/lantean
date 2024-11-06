import { storageKeys } from '../keys';
import { defaultStorage as storage } from '../helpers';

export type DragonBall = {
  id: string;
  stars: number;
  collected: boolean;
  location: string;
};

export const DRAGON_BALLS_KEY = storageKeys.dragonBalls.collected;

export async function getDragonBalls() {
  const dragonBallsString = await storage.getString(DRAGON_BALLS_KEY);

  if (!dragonBallsString) return [];

  return JSON.parse(dragonBallsString) as DragonBall[];
}

export async function setDragonBalls(dragonBalls: DragonBall[]) {
  await storage.set(DRAGON_BALLS_KEY, JSON.stringify(dragonBalls));
}

export async function deleteDragonBall(id: string): Promise<void> {
  const dragonBalls = await getDragonBalls();
  const updatedDragonBalls = dragonBalls.filter((ball) => ball.id !== id);

  await setDragonBalls(updatedDragonBalls);
}

export const dragonBallsStorage = {
  get: getDragonBalls,
  set: setDragonBalls,
  delete: deleteDragonBall,
};
