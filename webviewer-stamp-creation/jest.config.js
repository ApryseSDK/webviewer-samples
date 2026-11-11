/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '@happy-dom/jest-environment',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '\.css$': '<rootDir>/__tests__/config/style-mock.js',
  },
  // Babel options are inlined here (instead of a babel config file) so the react-scripts build is unaffected.
  transform: {
    '\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
};
