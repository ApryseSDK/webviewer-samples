import { Component, ReactNode, createElement } from "react";
import PDFViewer from "./components/PDFViewer";

import { WebViewerContainerProps } from "../typings/WebViewerProps";

import "./ui/WebViewer.css";

export default class WebViewer extends Component<WebViewerContainerProps> {
    render(): ReactNode {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mx = window.mx;
        const viewerProps = {
            ...this.props,
            annotationUser: this.props.annotationUser?.value,
            isVisible: this.props.isVisible?.value,
            mx
        };
        return <PDFViewer {...viewerProps} />;
    }
}
