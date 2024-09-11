// https://gist.github.com/dev99problems/5838f1a437b6fedd7b0aedb81e6c72fb
// https://stackoverflow.com/a/48042799

const oldEnv = process.env;

process.env = {
  // Make a copy
  ...oldEnv,
  API_KEY: 'fake_api_key',
  CLERK_HOSTNAME: 'clerk.dev',
  CLERK_WEBHOOK_SECRET: 'fake_webhook_secret',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'fake_publishable_key',
  NEXT_PUBLIC_CONVEX_URL: 'fake_convex_url',
};

// beforeEach(() => {
//   // MOST IMPORTANT THING IS 👇
//   jest.resetModules(); // Most important - it clears the cache
//   process.env = {
//     // Make a copy
//     ...oldEnv,
//     API_KEY: 'fake_api_key',
//     EMAIL_CONFIG_JSON: '{}',
//   };
// });

afterAll(() => {
  // Restore old environment
  process.env = oldEnv;
});
