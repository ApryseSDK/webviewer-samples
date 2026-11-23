/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '@happy-dom/jest-environment',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // Skip .NET build output and the copied WebViewer files.
  modulePathIgnorePatterns: ['<rootDir>/bin/', '<rootDir>/obj/', '<rootDir>/wwwroot/lib/'],
};
