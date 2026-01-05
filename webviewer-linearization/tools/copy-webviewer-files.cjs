// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// copy-webviewer-files.cjs

const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './client/public/webviewer/lib');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
