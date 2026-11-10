// Mirrors the react-scripts SVG loader: a default URL export plus a ReactComponent export.
const React = require('react');

module.exports = {
  __esModule: true,
  default: 'svg-mock',
  ReactComponent: () => React.createElement('svg'),
};
