const msal = require("@azure/msal-node");

const authFactory = (clientConfig) => {
    return new msal.ConfidentialClientApplication(clientConfig);
}

module.exports = authFactory;