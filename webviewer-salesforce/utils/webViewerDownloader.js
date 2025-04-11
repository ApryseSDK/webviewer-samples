// Download the latest Apryse WebViewer SDK,
// then extract the full contents to "webviewer" folder.


const download = require('download');
const extract = require('extract-zip');
const fs = require('fs');
const path = require('path');

// path constants
const zip = "WebViewer.zip";
const url = `https://www.pdftron.com/downloads/${zip}`;
const root = "./";
const dist = `${root}webviewer`;

// Text coloring
const CYAN  = '\u001b[36m';
const RESET = '\u001b[0m';
const GREEN = '\u001b[32m';
const RED   = '\u001b[31m';

process.stdout.write('\n');
console.log(`${CYAN}Downloading latest Apryse WebViewer from:`);
console.log(`${CYAN}${url}${RESET}`);
process.stdout.write('\n');

// Clean previous WebViewer.zip, if exists
if (fs.existsSync(zip)) {
    fs.unlinkSync(zip)
}

// Clean webviewer folder, if exists
if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
}

// Download WebViewer.zip locally
download(url, root).then(() => {
    if (fs.existsSync(zip)) {
        process.stdout.write('\n');
        console.log(`${GREEN}Downloading completed...${RESET}`);
        process.stdout.write('\n');
        
        process.stdout.write('\n');
        console.log(`${CYAN}Extracting ${zip} to:`);
        console.log(`${CYAN}${dist}${RESET}`);
        process.stdout.write('\n');
        
        // Extract .zip to appropriate folder
        extract(zip, { dir: path.resolve(dist)}).then(() => {
            process.stdout.write('\n');
            console.log(`${GREEN}Extraction completed...${RESET}`);
            process.stdout.write('\n');
            
            // Clean the downloaded WebViewer.zip
            if (fs.existsSync(zip)) {
                fs.unlinkSync(zip)
            }
        });
    }
    else {
        process.stdout.write('\n');
        console.log(`${RED}Downloading failed. The url ${url} could be currently disabled or disk is full.${RESET}`);
        process.stdout.write('\n');
    }
});
