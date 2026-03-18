export default {
  verbose: false,
  bail: false,
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.svelte'],
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.(m?js)$': 'babel-jest'
  },
  testEnvironmentOptions: {
    customExportConditions: ['browser', 'svelte', 'node', 'node-addons']
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  moduleFileExtensions: ['js', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['node_modules/(?!svelte|@testing-library)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom']
};
