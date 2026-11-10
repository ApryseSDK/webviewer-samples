/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '@happy-dom/jest-environment',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // Babel options are inlined here (instead of a babel config file) so Parcel's build is unaffected.
  transform: {
    '\\.[jt]s$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
};
