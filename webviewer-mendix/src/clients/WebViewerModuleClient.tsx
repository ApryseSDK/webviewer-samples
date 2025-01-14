class WebViewerModuleClient {
    private _mx: any;
    constructor(mx: any) {
        this._mx = mx;
    }
    getHeaders(additionalHeaders: any = {}): any {
        return {
            "X-Csrf-Token": this._mx.session.getConfig("csrftoken"),
            ...additionalHeaders
        };
    }
    async checkForModule(): Promise<boolean> {
        try {
            const res = await fetch("/rest/version/v1/modules/webviewer", {
                headers: this.getHeaders()
            });
            console.info("[Module] Connected:", await res.text());
            return true;
        } catch (e) {
            console.info("[Module] Not detected.");
            return false;
        }
    }
    async getFileInfo(fileId: string): Promise<any> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return;
        }
        try {
            const res = await fetch(`/rest/documentstore/v1/documents/${fileId}`, {
                headers: this.getHeaders()
            });
            return await res.json();
        } catch (e) {
            console.info("[Module] Not detected.");
            throw e;
        }
    }
    async updateFile(fileId: string, fileData: ArrayBuffer): Promise<void> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return;
        }
        try {
            await fetch(`/rest/documentstore/v1/documents/${fileId}`, {
                method: "PUT",
                headers: this.getHeaders(),
                body: fileData
            });
        } catch (e) {
            console.info("[Module] Failed to save document.", e);
            throw e;
        }
    }
    async saveFile(fileData: ArrayBuffer): Promise<string | null | undefined> {
        try {
            const res = await fetch(`/rest/documentstore/v1/documents`, {
                method: "POST",
                headers: this.getHeaders(),
                body: fileData
            });
            return await res.text();
        } catch (e) {
            console.info("[Module] Failed to save document.", e);
            throw e;
        }
    }
    async getAllXfdfCommands(fileId: string): Promise<any[]> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return [];
        }
        try {
            const res = await fetch(`/rest/documentstore/v1/documents/${fileId}/commands`, {
                method: "GET",
                headers: this.getHeaders()
            });
            return await res.json();
        } catch (e) {
            console.info("[Module] Failed to fetch XFDF commands.", e);
            throw e;
        }
    }
    async getLatestXfdfCommands(fileId: string, lastQueryDate: string): Promise<any[]> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return [];
        }
        try {
            const res = await fetch(
                `/rest/documentstore/v1/documents/${fileId}/commands?lastQueryDate=${lastQueryDate}`,
                {
                    method: "GET",
                    headers: this.getHeaders()
                }
            );
            return await res.json();
        } catch (e) {
            console.info("[Module] Failed to fetch latest XFDF commands.", e);
            throw e;
        }
    }
    async createXfdfCommand(fileId: string, command: string): Promise<void> {
        if (!fileId) {
            console.warn("Empty file ID was provided.");
            return;
        }
        try {
            await fetch(`/rest/documentstore/v1/documents/${fileId}/commands`, {
                method: "POST",
                headers: this.getHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({ XFDF: command })
            });
        } catch (e) {
            console.info(`[Module] Failed to add XFDF command. ${command}`, e);
            throw e;
        }
    }
}

export default WebViewerModuleClient;
