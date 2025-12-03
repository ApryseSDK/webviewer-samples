import fs from 'fs-extra';

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './client/lib');
    await fs.copy('./node_modules/@pdftron/webviewer/webviewer.min.js', './client/lib/webviewer.min.js');
    await fs.copy('./node_modules/spin.js/spin.js', './client/config/ui/spinjs/spin.js');
    await fs.copy('./node_modules/spin.js/spin.css', './client/config/ui/spinjs/spin.css');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
