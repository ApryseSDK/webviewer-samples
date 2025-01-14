const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './server/webviewer-annotations-asp-net-sample/Scripts/webviewer/lib');
    await fs.copy('./node_modules/@pdftron/webviewer/webviewer.min.js', './server/webviewer-annotations-asp-net-sample/Scripts/webviewer/lib/webviewer.min.js');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
