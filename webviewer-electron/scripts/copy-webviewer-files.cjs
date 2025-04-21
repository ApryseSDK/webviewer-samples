const fs = require('fs-extra');
const path = require('path');

/**
 * Learn more about this script at https://docs.apryse.com/web/guides/get-started/copy-assets
 */

const copyFiles = async () => {
  const sourcePath = path.resolve('./node_modules/@pdftron/webviewer/public');
  const destPath = path.resolve('./lib/webviewer');

  try {
    await fs.copy(sourcePath, destPath);
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles(); 