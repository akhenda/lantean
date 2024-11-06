import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import * as GetCharacters from './use-get-characters';

import { Character, updateDragonBallCharacterDescription } from '../../../../core/api/endpoints/dragon-ball';

export function useUpdateCharacter(page: number) {
  const queryClient = useQueryClient();
  const ongoingMutationCount = useRef(0);

  return useMutation(
    (characterId: number, description: string) => updateDragonBallCharacterDescription(characterId, description),
    {
      onMutate: async (characterId: number) => {
        ongoingMutationCount.current += 1;

        await queryClient.cancelQueries(GetCharacters.getQueryKey());

        const currentPage = queryClient.getQueryData<{ items: Character[] }>(GetCharacters.getQueryKey(page));
        const nextPage = queryClient.getQueryData<{ items: Character[] }>(GetCharacters.getQueryKey(page + 1));

        if (!currentPage) return;

        const newItems = currentPage.items.filter(({ id }) => id !== characterId);

        if (nextPage?.items.length) {
          const lastCharacterOnPage = currentPage.items[currentPage.items.length - 1];
          const indexOnNextPage = nextPage.items.findIndex((character) => character.id === lastCharacterOnPage.id);
          const nextCharacter = nextPage.items[indexOnNextPage + 1];

          if (nextCharacter) newItems.push(nextCharacter);
        }

        queryClient.setQueryData(GetCharacters.getQueryKey(page), { ...currentPage, items: newItems });

        return { currentCharactersPage: currentPage };
      },
      onError: (_, __, context) => {
        if (context?.currentCharactersPage) {
          queryClient.setQueryData(GetCharacters.getQueryKey(page), context.currentCharactersPage);
        }
      },
      onSettled: () => {
        ongoingMutationCount.current -= 1;

        if (ongoingMutationCount.current === 0) {
          queryClient.invalidateQueries(GetCharacters.getQueryKey());
        }
      },
    },
  );
}
