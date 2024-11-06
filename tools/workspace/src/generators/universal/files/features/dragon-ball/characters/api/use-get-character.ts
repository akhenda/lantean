import { useQuery } from '@tanstack/react-query';

import { Page, Character, getDragonBallCharacter } from '../../../../core/api/endpoints/dragon-ball';

const QUERY_KEY = 'character';

export function getQueryKey(id?: number) {
  if (id === undefined) return [QUERY_KEY];

  return [QUERY_KEY, id];
}

export function useGetCharacter(id: number) {
  const query = useQuery<Page<Character>, Error>(
    getQueryKey(id),
    ({ signal }) => getDragonBallCharacter(id, { signal }),
    { keepPreviousData: true },
  );

  return query;
}
