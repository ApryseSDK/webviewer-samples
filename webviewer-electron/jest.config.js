/** @type {import('jest').Config} */
module.exports = {
  // The renderer runs in a browser context. Main and preload tests opt into
  // the node environment with a `@jest-environment node` comment.
  testEnvironment: '@happy-dom/jest-environment',
  testMatch: ['**/__tests__/unit/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__tests__/config/style-mock.js',
  },
  // Babel options are inlined here (instead of a babel config file) so the Vite build is unaffected.
  transform: {
    '\\.[jt]s$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
        // Rewrites Vite's `import.meta.env` to `process.env`, since Jest runs CommonJS.
        plugins: ['babel-plugin-transform-vite-meta-env'],
      },
    ],
  },
};
