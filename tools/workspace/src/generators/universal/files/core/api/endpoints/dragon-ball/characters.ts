/**
 * Uses https://web.dragonball-api.com
 *
 * Base URL: http://dragonball-api.com/api
 */

import { Character, CharacterFilters, CharacterList } from './characters.types';
import { Page } from './types';

import { client } from '../../config';

const ENDPOINT = '/characters';

export async function getDragonBallCharacters(
  page: number,
  filters: CharacterFilters = {},
  options?: { signal?: AbortSignal },
) {
  const { items } = await client.get<Page<CharacterList>>(ENDPOINT, {
    params: { page, ...filters },
    signal: options?.signal,
  });

  return items;
}

export async function getDragonBallCharacter(id: number, options?: { signal?: AbortSignal }) {
  const { data } = await client.get<Character>(`${ENDPOINT}/${id}`, {
    signal: options?.signal,
  });

  return data;
}

export async function updateDragonBallCharacterDescription(id: number, description: string) {
  const { data } = await client.patch(`${ENDPOINT}/${id}`, { description });

  return data;
}
