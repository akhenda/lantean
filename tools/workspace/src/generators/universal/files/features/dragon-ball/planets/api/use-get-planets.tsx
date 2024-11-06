import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Page, Character, getDragonBallPlanets } from '../../../../core/api/endpoints/dragon-ball';

const QUERY_KEY = 'planets';

export function getQueryKey(page?: number) {
  if (page === undefined) return [QUERY_KEY];

  return [QUERY_KEY, page];
}

export function useGetCharacters(page: number) {
  const query = useQuery<Page<Character>, Error>(
    getQueryKey(page),
    ({ signal }) => getDragonBallPlanets(page, { isDestroyed: false }, { signal }),
    { keepPreviousData: true },
  );

  // Prefetch the next page!
  const queryClient = useQueryClient();

  useEffect(() => {
    if (query.data?.links.next) {
      queryClient.prefetchQuery(getQueryKey(page + 1), ({ signal }) =>
        getDragonBallPlanets(page + 1, { isDestroyed: false }, { signal }),
      );
    }
  }, [query.data, page, queryClient]);

  return query;
}
