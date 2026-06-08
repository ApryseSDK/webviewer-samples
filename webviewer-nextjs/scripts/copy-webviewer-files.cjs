const fs = require('fs-extra');

/**
 * Learn more about this script at https://docs.apryse.com/web/guides/get-started/copy-assets
 */

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './public/lib/webviewer');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();