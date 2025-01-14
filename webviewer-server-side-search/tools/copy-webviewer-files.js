const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './client/webviewer/lib');
    await fs.copy('./node_modules/@pdftron/webviewer/webviewer.min.js', './client/webviewer/lib/webviewer.min.js');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();