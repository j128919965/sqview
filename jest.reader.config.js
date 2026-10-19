const { jest: base } = require('./package.json');

module.exports = {
  ...base,
  // Reader component tests use their own fixtures and do not require Electron bundles.
  setupFiles: [],
  testMatch: [
    '<rootDir>/src/__tests__/Reader.test.tsx',
    '<rootDir>/src/__tests__/Image.test.tsx',
    '<rootDir>/src/__tests__/ImageCache.test.ts',
    '<rootDir>/src/__tests__/ViewerNavigation.test.tsx',
  ],
};
