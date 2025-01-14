import React, { createElement } from "react";
import type { WebViewerInstance } from "@pdftron/webviewer";
import type WebViewerModuleClient from "../../clients/WebViewerModuleClient";
import VirtualList from "./VirtualList";
import PageExtractionThumbnail from "./PageExtractionThumbnail";

interface PageExtractionModalInputProps {
    wvInstance: WebViewerInstance;
    moduleClient: WebViewerModuleClient;
    dataElement: string;
    allowDownload: boolean;
    allowSaveAs: boolean;
}

interface PageExtractionModalState {
    pageInput: string;
    pageCount: number[];
    includeAnnotations: boolean;
}

class PageExtractionModal extends React.Component<PageExtractionModalInputProps, PageExtractionModalState> {
    private _timeoutHandle: any;
    private _thumbnailSubscriptions: any;
    private _downloadRef: any;
    constructor(props: PageExtractionModalInputProps) {
        super(props);
        this._thumbnailSubscriptions = {};
        this._downloadRef = React.createRef();
        const doc = this.props.wvInstance.Core.documentViewer.getDocument();
        this.state = {
            pageInput: "1",
            pageCount: doc ? Array.from({ length: doc.getPageCount() }, (_, index) => index + 1) : [],
            includeAnnotations: true
        };
    }
    componentDidMount(): void {
        this.props.wvInstance.Core.documentViewer.addEventListener("documentLoaded", this.onDocumentLoaded);
        this.props.wvInstance.Core.documentViewer.addEventListener("documentUnloaded", this.onDocumentUnloaded);
    }
    componentWillUnmount(): void {
        this.props.wvInstance.Core.documentViewer.removeEventListener("documentLoaded", this.onDocumentLoaded);
        this.props.wvInstance.Core.documentViewer.removeEventListener("documentUnloaded", this.onDocumentUnloaded);
    }
    onDocumentLoaded = () => {
        this.setState({
            pageInput: "1",
            pageCount: Array.from(
                { length: this.props.wvInstance.Core.documentViewer.getDocument().getPageCount() },
                (_, index) => index + 1
            )
        });
    };
    onDocumentUnloaded = () => {
        this.setState({ pageInput: "1", pageCount: [] });
    };
    onPageInputChanged = (e: any) => {
        this.setState({
            pageInput: e.target.value || "1"
        });
        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle);
        }
        this._timeoutHandle = setTimeout(() => {
            const parsedInput = this.parsePageInputString(this.state.pageInput);
            this.setState({ pageInput: parsedInput });
            this.trigger(parsedInput);
        }, 1000);
    };
    onClickThumbnail = (pageNumber: number, isSelected: boolean) => {
        if (isSelected) {
            this.setState({
                pageInput: `${this.state.pageInput},${pageNumber}`
            });
        } else {
            const parsedInput = this.parsePageInputString(this.state.pageInput.replace(`${pageNumber}`, ""));
            this.setState({ pageInput: parsedInput });
            this.trigger(parsedInput);
        }
    };
    parsePageInputString = (input: string) => {
        if (!input) {
            return "1";
        }
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        const parts = input.split(",").map(input => input.replace(/[a-zA-Z]+/, "").trim());
        const sanitizedParts = parts.reduce((acc: string[], part: string | undefined | null): string[] => {
            if (!part || part.startsWith("-")) {
                return acc;
            }
            const rangeParts = part.split("-").sort();
            let finalPart = part;
            const isRange = rangeParts.length === 2;
            if (isRange) {
                let lower = rangeParts[0];
                let upper = rangeParts[1];
                if (lower > upper) {
                    const temp = lower;
                    lower = upper;
                    upper = temp;
                    finalPart = `${lower}-${upper}`;
                } else if (lower === upper) {
                    finalPart = lower;
                }
                if (Number(lower) > numPages || Number(lower) < 1 || Number(upper) > numPages || Number(upper) < 1) {
                    return acc;
                }
            } else {
                if (Number(rangeParts[0]) > numPages || Number(rangeParts[0]) < 1) {
                    return acc;
                }
                finalPart = rangeParts[0];
            }
            acc.push(finalPart);
            return acc;
        }, []);

        return sanitizedParts.join(",");
    };
    stringToPageArray = (input: string): number[] => {
        const parts = input.split(",");
        const pages: number[] = [];
        parts.forEach((part: string) => {
            const rangeParts = part.split("-").sort();
            const isRange = rangeParts.length === 2;
            if (isRange) {
                const lower = Number(rangeParts[0]);
                const upper = Number(rangeParts[1]);
                Array.from({ length: upper - lower + 1 }, (_, index) => pages.push(index + lower));
            } else {
                pages.push(Number(part));
            }
        });
        return pages;
    };
    subscribe = (pageNumber: number, handler: any) => {
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        if (!pageNumber || pageNumber > numPages || !handler) {
            return;
        }
        if (!this._thumbnailSubscriptions[pageNumber]) {
            this._thumbnailSubscriptions[pageNumber] = [];
        }
        this._thumbnailSubscriptions[pageNumber].push(handler);
    };
    unsubscribe = (pageNumber: number, handler: any) => {
        const numPages = this.props.wvInstance.Core.documentViewer.getDocument().getPageCount();
        if (!pageNumber || pageNumber > numPages || !handler) {
            return;
        }
        this._thumbnailSubscriptions[pageNumber] = this._thumbnailSubscriptions[pageNumber].reduce(
            (acc: any[], registeredHandler: any) => {
                if (registeredHandler !== handler) {
                    acc.push(registeredHandler);
                }
                return acc;
            },
            []
        );
    };
    trigger = (input: string) => {
        Object.values(this._thumbnailSubscriptions).forEach((handlers: any[]) =>
            handlers.forEach(handler => handler(input))
        );
    };
    renderThumbnail = (pageNumber: number) => {
        return (
            <PageExtractionThumbnail
                wvInstance={this.props.wvInstance}
                pageNumber={pageNumber}
                addFileInputEventListener={this.subscribe}
                removeFileInputEventListener={this.unsubscribe}
                onClick={this.onClickThumbnail}
            />
        );
    };
    onToggleIncludeAnnotations = (e: any) => {
        this.setState({ includeAnnotations: e.target.checked });
    };
    onCancel = () => {
        this.props.wvInstance.UI.closeElements([this.props.dataElement]);
    };
    onDownload = async () => {
        const doc = this.props.wvInstance.Core.documentViewer.getDocument();
        if (!doc) {
            console.warn("No document is loaded. Unable to extract pages");
        }
        try {
            this.props.wvInstance.UI.openElements(["loadingModal"]);
            const pages = this.stringToPageArray(this.state.pageInput);
            let xfdf;
            if (this.state.includeAnnotations) {
                xfdf = await this.props.wvInstance.Core.annotationManager.exportAnnotations();
            }
            const extracted = await doc.extractPages(pages, xfdf);
            const downloadBlob = new Blob([extracted], { type: "application/pdf" });
            const downloadUrl = URL.createObjectURL(downloadBlob);
            this._downloadRef.current.href = downloadUrl;
            this._downloadRef.current.download = doc
                .getFilename()
                .split(".")
                .map((part, index, arr) => (index === arr.length - 1 ? "-extracted.pdf" : part))
                .join(".");
            this._downloadRef.current.click();
            this.props.wvInstance.UI.closeElements([this.props.dataElement]);
        } finally {
            this.props.wvInstance.UI.closeElements(["loadingModal"]);
        }
    };
    onSaveToMendix = async () => {
        const doc = this.props.wvInstance.Core.documentViewer.getDocument();
        if (!doc) {
            console.warn("No document is loaded. Unable to extract pages");
        }
        try {
            this.props.wvInstance.UI.openElements(["loadingModal"]);
            const pages = this.stringToPageArray(this.state.pageInput);
            let xfdf;
            if (this.state.includeAnnotations) {
                xfdf = await this.props.wvInstance.Core.annotationManager.exportAnnotations();
            }
            const extracted = await doc.extractPages(pages, xfdf);
            await this.props.moduleClient.saveFile(extracted);
            this.props.wvInstance.UI.closeElements([this.props.dataElement]);
        } finally {
            this.props.wvInstance.UI.closeElements(["loadingModal"]);
        }
    };
    render(): JSX.Element {
        return (
            <div className="Modal WarningModal">
                <div className="container">
                    <div className="header">Page Extraction</div>
                    <div
                        className="body"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ margin: "1em" }}>
                            <span>Pages:</span>
                            <div style={{ display: "flex", flexDirection: "column", marginTop: "0.5em" }}>
                                <input
                                    type="text"
                                    style={{ height: "28px" }}
                                    placeholder="e.g. 1,3-5,9,2,7-8"
                                    defaultValue={this.state.pageInput}
                                    value={this.state.pageInput}
                                    onChange={this.onPageInputChanged}
                                />
                                <span style={{ color: "#868e96" }}>e.g. 1,3-5,9,2,7-8</span>
                            </div>
                        </div>
                        <VirtualList
                            height="400px"
                            padding={13}
                            render={this.renderThumbnail}
                            items={this.state.pageCount}
                        />
                        <div style={{ display: "flex", flexDirection: "row", marginTop: "1em" }}>
                            <span>Include annotations?</span>
                            <input
                                type="checkbox"
                                onClick={this.onToggleIncludeAnnotations}
                                checked={this.state.includeAnnotations}
                            />
                        </div>
                        <a ref={this._downloadRef} style={{ display: "hidden" }} />
                    </div>
                    <div className="footer">
                        <div className="Button cancel modal-button" onClick={this.onCancel}>
                            Cancel
                        </div>
                        {this.props.allowDownload ? (
                            <div className="Button confirm modal-button" onClick={this.onDownload}>
                                Download
                            </div>
                        ) : undefined}
                        {this.props.allowSaveAs ? (
                            <div className="Button confirm modal-button" onClick={this.onSaveToMendix}>
                                Save to Mendix
                            </div>
                        ) : undefined}
                    </div>
                </div>
            </div>
        );
    }
}

export default PageExtractionModal;
