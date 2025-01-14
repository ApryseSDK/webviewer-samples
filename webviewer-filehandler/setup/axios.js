const axios = require('axios');
const { log } = require('./logger');

const getHeaders = (token) => ({
    headers: {
        "authorization": `Bearer ${token}`,
        "content-type": "application/json",
    },
});

async function isError(response) {
    if (!response.ok) {
        const txt = await response.clone().text();
        log(`Error: ${txt}`);
        throw Error(txt);
    }
    return response;
}

function toJson(parser) {
    return async () => {
        const json = await response.json();
        return parser ? parser(json) : json.value ? json.value : json;
    };
}

module.exports = {
    axios, 
    getHeaders,
    // isError,
    // toJson,
}
