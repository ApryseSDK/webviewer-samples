import React from 'react';
import Viewer from './components/Viewer/Viewer';
import Dropzone from './components/Dropzone/Dropzone';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Dropzone />
      <Viewer docToLoad='/files/PDFTRON_about.pdf'/>
      <Viewer docToLoad='/files/Newsletter.docx'/>
    </div>
  );
};

export default App;
