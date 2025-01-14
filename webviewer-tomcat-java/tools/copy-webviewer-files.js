const fs = require('fs-extra');

const copyFiles = async () => {
    try {
        await fs.copySync('./node_modules/@pdftron/webviewer/public', './webapps/webviewer/lib');
        await fs.copySync('./node_modules/@pdftron/webviewer/webviewer.min.js', './webapps/webviewer/lib/webviewer.min.js');
        console.log('WebViewer files copied over successfully');
    } catch (err) {
        console.error(err);
    }
};

copyFiles();