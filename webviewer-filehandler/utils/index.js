function toBase64(data) {
    return Buffer.from(data, 'utf8').toString('base64');
}

function fromBase64(data) {
    return Buffer.from(data, "base64").toString("utf8");
}

module.exports = {
    toBase64,
    fromBase64,
}