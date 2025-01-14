const { reset, log } = require('./logger');
const { getToken, injectManifest, ensureApp, createLocalEnv } = require('./tasks/index.js');

async function setup(workingDir = process.env.PWD) {
    reset();
    log('Starting local development setup prcess');
    log(`Working directory: ${workingDir}`);

    const { token, tenantId } = await getToken();

    //we need to register an application for webviewer in Azure Active Directory.
    const { appId, appSecret, created, id } = await ensureApp(token);

    if (created) {
        await injectManifest(token ,id);

        createLocalEnv(workingDir, tenantId, appId, appSecret);
    }
}

module.exports = setup;