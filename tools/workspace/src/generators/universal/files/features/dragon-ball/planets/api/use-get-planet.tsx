import { useQuery } from '@tanstack/react-query';

import { Page, Planet, getDragonBallPlanet } from '../../../../core/api/endpoints/dragon-ball';

const QUERY_KEY = 'planet';

export function getQueryKey(id?: number) {
  if (id === undefined) return [QUERY_KEY];

  return [QUERY_KEY, id];
}

export function useGetPlanet(id: number) {
  const query = useQuery<Page<Planet>, Error>(
    getQueryKey(id),
    ({ signal }) => getDragonBallPlanet(id, { signal }),
    { keepPreviousData: true },
  );

  return query;
}
