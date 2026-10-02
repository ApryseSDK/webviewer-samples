const fs = require('fs-extra');

const copyFiles = async () => {
  await fs.copy('./node_modules/@pdftron/webviewer/public', './public/webviewer');
  console.log('WebViewer files copied over successfully');
};

copyFiles().catch(err => {
  console.error(err);
  process.exitCode = 1;
});