const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './public/webviewer/lib');
    await fs.copy('./node_modules/@pdftron/webviewer-bim-client/dist', './public/webviewer-bim/');
    console.log('WebViewer and WebViewer BIM files copied over successfully.');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
