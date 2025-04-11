const fs = require('fs-extra');
const path = require('path');

// Source and destination directories
const sourceDir = './webviewer/webviewer-salesforce';
const destinationDir = './force-app/main/default/staticresources';

function copyFilesByExtension(files, ext) {
    // Filter files with the extension
    const filesToCopy = files.filter(file => path.extname(file) === `.${ext}`);
    
    // Copy file to the destination
    filesToCopy.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destinationPath = path.join(destinationDir, file);
        
        fs.copyFile(sourcePath, destinationPath, err => {
            if (err) {
                console.error(`Error copying ${file}:`, err);
            } else {
                console.log(`${file} copied successfully!`);
            }
        });
    });
}

function copyStaticResources() {
    console.log(`Copying static resources (.zip & .xml) from ${sourceDir} to ${destinationDir}`);
    console.log('...');

    // Read all files in the source directory
    fs.readdir(sourceDir, (err, files) => {
        if (err) {
            console.error('Error reading source directory:', err);
            return;
        }
        
        // Copy zip files
        copyFilesByExtension(files, "zip");
        // Copy xml files
        copyFilesByExtension(files, "xml");
    });
}

copyStaticResources();
