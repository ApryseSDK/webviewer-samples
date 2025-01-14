import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";
import { WebViewerPreviewProps } from "../typings/WebViewerProps";

declare function require(name: string): string;

export class preview extends Component<WebViewerPreviewProps> {
    render(): ReactNode {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mx = window.mx;
        const viewerProps = {
            ...this.props,
            isVisible: this.props.isVisible === "true",
            mx
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return <PDFViewer {...viewerProps} />;
    }
}

export function getPreviewCss(): string {
    return require("./ui/WebViewer.css");
}
