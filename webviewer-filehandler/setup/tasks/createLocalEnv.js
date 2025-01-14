const { log, enter, leave } = require('../logger');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

function createLocalEnv(path, tenantId, clientId, clientSecret) {
    enter('Create local .env file in the root folder');

    const envFile = [];
    envFile.push(`TENANT_ID=${tenantId}`);
    envFile.push(`CLIENT_ID=${clientId}`);
    envFile.push(`CLIENT_SECRET=${clientSecret}`);
    envFile.push(`FILE_HANDLER_SITE_HOST_URL=http://localhost:3000`);

    log('Writing .env file.');

    writeFileSync(resolve(path, ".env"), envFile.join('\n') + '\n');

    leave('Creat local .env file');
}

module.exports = createLocalEnv;