const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');
const authFactory = require('./helpers/authFactory.helper') ;
const { toBase64, fromBase64 } = require('./utils/index');
const applyMiddleWares = require("./applyMiddleWares");
const qs = require('querystring');
require('dotenv').config();

applyMiddleWares(app);

app.post('/webviewer', async (req, res) => {
    const { token } = req.session;
    if (token) {
        const activationItems = `${JSON.parse(req.body.items)[0]}`;
        req.session.activationItems = activationItems;
        const resp = await axios.get(activationItems, {
            headers: {
              'authorization': `Bearer ${token}`
            },
        });
        
        const { "@microsoft.graph.downloadUrl": downloadUrl } = resp.data
        res.redirect(`/index.html?filepath=${downloadUrl}`);
    } else {
        const state = toBase64(JSON.stringify({
            target: req.url, 
            activationParams: {
                items: req.body.items
            }
        }));

        const tenantId = process.env.TENANT_ID;
        const authClient = authFactory({
            auth: {
                clientId: process.env.CLIENT_ID,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                clientSecret: process.env.CLIENT_SECRET
            }
        });
        const authUrl = await authClient.getAuthCodeUrl({
            scopes: ["openid", "Files.ReadWrite.Selected"],
            redirectUri: 'http://localhost:3000/api/auth/login',
            state
        });
    
        res.set('x-frame-options', 'SAMEORIGIN');
        res.writeHead(302, {
            location: authUrl,
        });
        res.end();
    }
});

app.get('/webviewer', async (req, res) => {
    const loginState = JSON.parse(fromBase64(req.query.state));
    const resp = await axios.get(`${JSON.parse(loginState.activationParams.items)[0]}`, {
        headers: {
          'authorization': `Bearer ${req.query.token}`
        },
    });
    req.session.activationItems = `${JSON.parse(loginState.activationParams.items)[0]}`;
    const { "@microsoft.graph.downloadUrl": downloadUrl } = resp.data
    res.redirect(`/index.html?filepath=${downloadUrl}`);
});

app.get('/api/auth/login', async (req, res) => {
    if(req.query.state === 'app-consent') {
        return res.redirect('/app-code');
    }
    if (req.query.state === 'code-for-access-token') {
        return res.redirect(`/app-access-token?code=${req.query.code}`);
    }

    const tenantId = process.env.TENANT_ID;
    const authClient = authFactory({
        auth: {
            clientId: process.env.CLIENT_ID,
            authority: `https://login.microsoftonline.com/${tenantId}`,
            clientSecret: process.env.CLIENT_SECRET
        }
    });

    const state = JSON.parse(fromBase64(req.query.state));
    const { code } = req.query;

    const tokenResp = await authClient.acquireTokenByCode({
        code,
        redirectUri: 'http://localhost:3000/api/auth/login',
        scopes: ['openid', 'Files.ReadWrite.All']
    });
    req.session.token = tokenResp.accessToken;

    res.redirect(`${state.target}?state=${req.query.state}&token=${tokenResp.accessToken}&expiresOn=${tokenResp.expiresOn}`);
});

app.get('/token', async (req, res) => {
    if (req.session.token) {
        res.send({
            message: 'success',
            data: {
                token: req.session.token,
                activationItems: req.session.activationItems
            }
        })
    } else {
        res.send({
            status: 'fail',
            message: "Couldn't get token."
        });
    }
});

app.get('/app-reset-cache', async (req, res) => {
    const app_tenant_id = process.env.TENANT_ID;
    const app_client_id = process.env.CLIENT_ID;

    const targetUrl = `https://login.microsoftonline.com/${app_tenant_id}/oauth2/v2.0/authorize?
        client_id=${app_client_id}
        &response_type=code
        &redirect_uri=http%3A%2F%2Flocalhost:3000%2Fapi%2Fauth%2Flogin
        &response_mode=query
        &scope=Sites.ReadWrite.All
        &state=app-consent
    `;
    res.redirect(targetUrl);
});

app.get('/app-code', async (req, res) => {
    const app_tenant_id = process.env.TENANT_ID;
    const app_client_id = process.env.CLIENT_ID;
    const app_client_secret = process.env.CLIENT_SECRET;
    const sharepoint_tenant_id = process.env.SHAREPOINT_TENANT_ID;
    const authClient = authFactory({
        auth: {
            clientId: app_client_id,
            authority: `https://login.microsoftonline.com/${app_tenant_id}`,
            clientSecret: app_client_secret
        }
    });
    const authUrl = await authClient.getAuthCodeUrl({
        scopes: [`https://${sharepoint_tenant_id}-my.sharepoint.com/Sites.ReadWrite.All`],
        redirectUri: 'http://localhost:3000/api/auth/login',
        state: 'code-for-access-token'
    });
    res.redirect(authUrl);
});

app.get('/app-access-token', async (req, res) => {
    const app_tenant_id = process.env.TENANT_ID;
    const app_client_id = process.env.CLIENT_ID;
    const sharepoint_tenant_id = process.env.SHAREPOINT_TENANT_ID;
    const app_client_secret = process.env.CLIENT_SECRET;
    try {
        const { code } = req.query;
        const authClient = authFactory({
            auth: {
                clientId: app_client_id,
                authority: `https://login.microsoftonline.com/${app_tenant_id}`,
                clientSecret: app_client_secret
            }
        });
        const tokenResp = await authClient.acquireTokenByCode({
            code,
            redirectUri: 'http://localhost:3000/api/auth/login',
            scopes: [`https://${sharepoint_tenant_id}-my.sharepoint.com/Sites.ReadWrite.All`]
        });
        const { accessToken } = tokenResp;

        const sharepointResetUrl = `https://${sharepoint_tenant_id}-my.sharepoint.com/_api/v2.0/drive/apps?forceRefresh=1`;

        const sharepointConfigResp = await axios({
            method: 'GET',
            url: sharepointResetUrl,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (sharepointConfigResp.status === 200) {
            res.send('Successfully reset the cache.')
        }
    } catch(error) {
        console.log(error)
    }
})

app.listen(port, () => {
    console.log('example app listening on ', port);
});