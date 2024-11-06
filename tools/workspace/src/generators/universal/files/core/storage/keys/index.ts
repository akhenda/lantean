/**
 * storage keys
 */
export const storageKeys = {
  app: { id: 'app-storage', locale: 'app.locale' },
  dragonBalls: { id: 'dragon-balls-storage', collected: 'dragon-balls.collected' },
  featureFlag: { id: 'feature-flag-storage' },
  query: { id: 'query-storage' },
  session: { id: 'session-storage', token: 'session.token' },
  store: { id: 'store-storage' },
} as const;
