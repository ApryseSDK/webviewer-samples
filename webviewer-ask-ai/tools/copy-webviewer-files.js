import fs from 'fs-extra';

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './client/libs/webviewer');
    await fs.copy('./node_modules/@pdftron/webviewer/webviewer.min.js', './client/libs/webviewer/webviewer.min.js');
    await fs.copy('./node_modules/spin.js/spin.js', './client/libs/spinjs/spin.js');
    await fs.copy('./node_modules/spin.js/spin.css', './client/libs/spinjs/spin.css');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
