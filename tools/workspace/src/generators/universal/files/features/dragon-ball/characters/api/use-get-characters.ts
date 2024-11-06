import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Page, Character, getDragonBallCharacters } from '../../../../core/api/endpoints/dragon-ball';

const QUERY_KEY = 'characters';

export function getQueryKey(page?: number) {
  if (page === undefined) return [QUERY_KEY];

  return [QUERY_KEY, page];
}

export function useGetCharacters(page: number) {
  const query = useQuery<Page<Character>, Error>(
    getQueryKey(page),
    ({ signal }) => getDragonBallCharacters(page, { affiliation: 'Z Fighter' }, { signal }),
    { keepPreviousData: true },
  );

  // Prefetch the next page!
  const queryClient = useQueryClient();

  useEffect(() => {
    if (query.data?.links.next) {
      queryClient.prefetchQuery(getQueryKey(page + 1), ({ signal }) =>
        getDragonBallCharacters(page + 1, { affiliation: 'Z Fighter' }, { signal }),
      );
    }
  }, [query.data, page, queryClient]);

  return query;
}
