import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Set the path to your Web Worker. This will be relative to your html file
// (which is in `public`) so you will need to path to `'./lib/core'`
window.CoreControls.setWorkerPath('./lib/core');

ReactDOM.render(<App />, document.getElementById('root'));
