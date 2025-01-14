const { log, enter, leave } = require("../logger.js");
const { v4 } = require('uuid');
const { axios, getHeaders } = require('../axios');

const actions = [
    {
        "type": "newFile",
        "url": "http://localhost:3000/webviewer",
        // tslint:disable-next-line: object-literal-sort-keys
        "availableOn": {
            "file": {
                "extensions": [
                    ".pdf",
                ],
            },
            "web": {},
        },
    },
    {
        "type": "open",
        "url": "http://localhost:3000/webviewer",
        // tslint:disable-next-line: object-literal-sort-keys
        "availableOn": {
            "file": {
                "extensions": [
                    ".pdf",
                ],
            },
            "web": {},
        },
    },
    {
        "type": "preview",
        "url": "http://localhost:3000/webviewer",
        // tslint:disable-next-line: object-literal-sort-keys
        "availableOn": {
            "file": {
                "extensions": [
                    ".pdf",
                ],
            },
            "web": {},
        },
    },
];

const fileTypeIcon = {
    svg: "http://localhost:3000/images/icons/app-icon.svg",
    png1x: "http://localhost:3000/images/icons/app-icon@1x.png",
    "png1.5x": "http://localhost:3000/images/icons/app-icon@1.5x.png",
    png2x: "http://localhost:3000/images/icons/app-icon@2x.png",
};

const appIcon = {
    svg: "http://localhost:3000/images/icons/app-icon.svg",
    png1x: "http://localhost:3000/images/icons/app-icon@1x.png",
    "png1.5x": "http://localhost:3000/images/icons/app-icon@1.5x.png",
    png2x: "http://localhost:3000/images/icons/app-icon@2x.png",
};

const defaultManifest = {
    "id": v4(),
    "properties": [
        {
            "key": "version",
            "value": "2",
        },
        {
            "key": "fileTypeDisplayName",
            "value": "Webviewer Demo",
        },
        {
            "key": "fileTypeIcon",
            // tslint:disable-next-line: max-line-length
            "value": JSON.stringify(fileTypeIcon),
        },
        {
            "key": "appIcon",
            // tslint:disable-next-line: max-line-length
            "value": JSON.stringify(appIcon),
        },
        {
            "key": "actions",
            // tslint:disable-next-line: max-line-length
            "value": JSON.stringify(actions),
        },
    ],
    "type": "FileHandler",
}

const InjectManifest = async (token, objectId) => {

    enter("InjectManifest");

    log(`Injecting manifest into app: ${objectId}. This operation will clear all previous manifests added for this app.`);

    await axios.put(`https://graph.microsoft.com/v1.0/applications/${objectId}/addIns`,
        {
            value: [defaultManifest],
        },
        {
            ...getHeaders(token)
        },
    )

    log("Injected manifest successfully.");

    leave("InjectManifest");
};

module.exports = InjectManifest;