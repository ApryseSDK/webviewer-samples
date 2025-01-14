import { uploadLargeFile, uploadSmallFile } from './utils/index.js';

let i;

WebViewer({
    path: '/assets/js/lib',
    css: '/assets/css/index.css'
}, document.getElementById('viewer'))
    .then(async (instance) => {
        createSetSaveButton(instance);
        const filepath = window.location.search.replace('?filepath=', '');
        i = instance;
        createSavedModal(instance);
        const doc = await instance.Core.createDocument(filepath, { extension: 'pdf' });
        instance.loadDocument(doc);
    })

const saveButton = document.getElementById('save-button');

async function saveDocument(instance) {
    let annotationManager = instance.Core.annotationManager;
    const xfdfString = await annotationManager.exportAnnotations();
    const content = await instance.Core.documentViewer.getDocument().getFileData({ xfdfString });
    const contentSize = await instance.Core.documentViewer.getDocument().getFileSize();
    const isLargeFile = contentSize > 4 * 1024 * 1024;
    const tokenResp = await fetch('/token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const tokenResult = await tokenResp.json();
    if (tokenResult.message !== 'success') {
        return alert("Couldn't retreive token.");
    }
    const { activationItems, token } = tokenResult.data;
    const itemResp = await fetch(activationItems, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (itemResp.status !== 200) {
        return alert("Failed to retreive the file information.")
    }
    const itemInfo = await itemResp.clone().json();
    const itemUrl = `https://graph.microsoft.com/v1.0/drives/${itemInfo.parentReference.driveId}/items/${itemInfo.id}`;

    if (isLargeFile) {
        uploadLargeFile(itemUrl, content, token);
    } else {
        uploadSmallFile(itemUrl, content, token);
    }
}



function createSetSaveButton(instance) {
    instance.setHeaderItems(function (header) {
        const saveButton = {
            type: 'actionButton',
            dataElement: 'saveDocumentButton',
            title: 'tool.SaveDocument',
            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
            onClick: async function() {
                instance.openElement('loadingModal');
                await saveDocument(instance);
                instance.closeElements(['loadingModal']);
                instance.openElement('savedModal');
            }
        } 
        header.get('viewControlsButton').insertBefore(saveButton);
    });
}

function createSavedModal(instance) {
    const divInput1 = document.createElement('div');
    divInput1.innerText = 'File saved successfully.';
    const modal = {
        dataElement: 'savedModal',
        body: {
            className: 'myCustomModal-body',
            style: {
            'text-align': 'center'
            }, // optional inline styles
            children: [ divInput1 ], // HTML dom elements
        },
    };
    instance.UI.addCustomModal(modal);
}