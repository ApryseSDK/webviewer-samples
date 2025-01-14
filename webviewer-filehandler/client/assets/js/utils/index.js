async function uploadLargeFile(itemUrl, content, token) {
    const uploadSessionUrl = `${itemUrl}/createUploadSession`;
    const uploadRequestResp = await fetch(uploadSessionUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
    const uploadRequestRespJson = await uploadRequestResp.json();
    if (uploadRequestRespJson.error) {
        return alert('upload request fails');
    }
    const { "uploadUrl": uploadUrl } = uploadRequestRespJson;
    const chunkLimit = 1024 * 1024 * 2;
    const totalSize = content.byteLength;
    let currentSizeOffset = 0;
    while(currentSizeOffset < totalSize) {
        const chunkSize = Math.min(chunkLimit, totalSize - currentSizeOffset);
        const chunk = content.slice(currentSizeOffset, currentSizeOffset + chunkSize);

        const uploadResp = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Length': chunk.byteLength.toString(),
                'Content-Range': `bytes ${currentSizeOffset}-${
                    currentSizeOffset + chunkSize - 1
                }/${totalSize}`,
            },
            body: chunk
        });
        if (!uploadResp.ok) {
            return alert('upload failed')
        }
        currentSizeOffset += chunkSize;
    }
};

async function uploadSmallFile(itemUrl, content, token) {
    const contentUrl = `${itemUrl}/content`;
    const uploadResult = await fetch(contentUrl, {
        body: content,
        headers: {
        authorization: `Bearer ${token}`,
        },
        method: "PUT",
    });

    if (!uploadResult.ok) {
        return alert('Upload failed.')
    }
}

export {
    uploadLargeFile,
    uploadSmallFile,
}