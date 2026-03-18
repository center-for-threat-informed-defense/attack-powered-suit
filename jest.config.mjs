export default {
  verbose: false,
  bail: false,
  testEnvironment: 'jsdom',
  // Force CJS transformer path to avoid ESM-only sync error in svelte-jester
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true, loadSvelteConfig: true }],
    '^.+\\.(m?js)$': 'babel-jest'
  },
  testEnvironmentOptions: {
    customExportConditions: ['browser', 'svelte', 'node', 'node-addons']
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  moduleFileExtensions: ['js', 'mjs', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  // Ensure Svelte internals aren't ignored by the transformer
  transformIgnorePatterns: ['node_modules/(?!(svelte|svelte/.*|@testing-library)/)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom']
};
