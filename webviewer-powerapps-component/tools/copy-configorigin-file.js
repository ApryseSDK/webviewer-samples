const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./configorigin.txt', './lib/ui/configorigin.txt');
    console.log('Configorigin copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
