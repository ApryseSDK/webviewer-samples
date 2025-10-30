const fs = require('fs-extra');
const path = require('path');

// Source and destination directories
const sourceDir = './webviewer/webviewer-salesforce';
const destinationDir = './force-app/main/default/staticresources';

// Text coloring
const RESET = '\u001b[0m';
const RED   = '\u001b[31m';

function copyFilesByExtension(files, ext) {
    // Filter files with the extension
    const filesToCopy = files.filter(file => path.extname(file) === `.${ext}`);
    
    // Copy file to the destination
    filesToCopy.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destinationPath = path.join(destinationDir, file);
        
        fs.copyFile(sourcePath, destinationPath, err => {
            if (err)
                console.error(`${RED}Unable to copy static resources. Error copying ${file}.${RESET}`, err);
            else
                console.log(`${file} copied successfully!`);
        });
    });
}

function copyStaticResources() {
    console.log(`Copying static resources (.zip & .xml) from ${sourceDir} to ${destinationDir}`);
    console.log('...');

    if (!fs.existsSync(sourceDir)) {
        console.error(`${RED}Unable to copy static resources. Source directory (${sourceDir}) does not exist.${RESET}`);
        return;
    }

    // Read all files in the source directory
    fs.readdir(sourceDir, (err, files) => {
        if (err) {
            console.error(`${RED}Unable to copy static resources. Error reading source directory (${sourceDir}).${RESET}`, err);
            return;
        }
        
        // Copy zip files
        copyFilesByExtension(files, "zip");
        // Copy xml files
        copyFilesByExtension(files, "xml");
    });
}

copyStaticResources();
