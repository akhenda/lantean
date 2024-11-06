/**
 * Uses https://web.dragonball-api.com
 *
 * Base URL: http://dragonball-api.com/api
 */

import { Planet, PlanetFilters } from './planets.types';

import { client } from '../../config';

const ENDPOINT = '/planets';

export async function getDragonBallPlanets(
  page: number,
  filters: PlanetFilters = {},
  options?: { signal?: AbortSignal },
) {
  const { items } = await client.get<Planet[]>(ENDPOINT, {
    params: { page, ...filters },
    signal: options?.signal,
  });

  return items;
}

export async function getDragonBallPlanet(id: number, options?: { signal?: AbortSignal }) {
  const { data } = await client.get<Planet>(`${ENDPOINT}/${id}`, {
    signal: options?.signal,
  });

  return data;
}
