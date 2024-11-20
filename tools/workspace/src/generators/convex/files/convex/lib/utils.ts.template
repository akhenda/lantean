import { ConvexError } from 'convex/values';

import { MutationCtx, QueryCtx } from '../_generated/server';

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
    .first();

  if (!user) throw new ConvexError('Expected user to be defined');

  return user;
}
