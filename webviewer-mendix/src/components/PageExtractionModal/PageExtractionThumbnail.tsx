import React, { createElement } from "react";

interface PageExtractionThumbnailInputProps {
    wvInstance: any;
    pageNumber: number;
    addFileInputEventListener: any;
    removeFileInputEventListener: any;
    onClick: any;
}

interface PageExtractionThumbnailState {
    thumbnail?: string;
    isHover: boolean;
    isSelected: boolean;
    isDisabled: boolean;
}

const ListItemStyle = { display: "inline-block", boxShadow: "1px 1px 8px black", position: "relative" };
const ListItemHoverStyle = { ...ListItemStyle, boxShadow: "1px 1px 5px #3183c8" };

class PageExtractionThumbnail extends React.Component<PageExtractionThumbnailInputProps, PageExtractionThumbnailState> {
    constructor(props: PageExtractionThumbnailInputProps) {
        super(props);
        this.props.wvInstance.Core.documentViewer
            .getDocument()
            .getDocumentCompletePromise()
            .then(() => {
                this.props.wvInstance.Core.documentViewer
                    .getDocument()
                    .loadThumbnail(this.props.pageNumber, (thumbnailCanvas: HTMLCanvasElement) => {
                        this.setState({
                            thumbnail: thumbnailCanvas.toDataURL()
                        });
                    });
            });
        this.state = {
            thumbnail: undefined,
            isHover: false,
            isSelected: this.props.pageNumber === 1,
            isDisabled: false
        };
    }
    componentDidMount(): void {
        this.props.addFileInputEventListener(this.props.pageNumber, this.onFileInputChanged);
    }
    componentWillUnmount(): void {
        this.props.removeFileInputEventListener(this.props.pageNumber, this.onFileInputChanged);
    }
    onFileInputChanged = (input: string) => {
        const parts = input.split(",").sort();
        let occurrances = 0;
        let isSelected = false;
        for (const part of parts) {
            const rangeParts = part.split("-").sort();
            const isRange = rangeParts.length === 2;

            if (isRange) {
                const lower = Number(rangeParts[0]);
                const upper = Number(rangeParts[1]);
                if (this.props.pageNumber >= lower && this.props.pageNumber <= upper) {
                    isSelected = true;
                    occurrances = occurrances ? occurrances++ : 2;
                }
            } else if (Number(part) === this.props.pageNumber) {
                isSelected = Number(rangeParts[0]) === this.props.pageNumber;
                occurrances++;
            }
        }
        this.setState({
            isSelected,
            isDisabled: occurrances > 1
        });
    };
    onHoverEnter = () => {
        if (this.state.isDisabled) {
            return;
        }
        this.setState({ isHover: true });
    };
    onHoverLeave = () => {
        if (this.state.isDisabled) {
            return;
        }
        this.setState({ isHover: false });
    };
    onClick = () => {
        if (this.state.isDisabled) {
            return;
        }
        this.setState({ isSelected: !this.state.isSelected });
        this.props.onClick(this.props.pageNumber, !this.state.isSelected);
    };
    render(): JSX.Element {
        const { thumbnail, isHover, isSelected } = this.state;
        const listItemStyle = isHover ? ListItemHoverStyle : ListItemStyle;
        return (
            <div
                // @ts-ignore
                style={listItemStyle}
                onMouseEnter={this.onHoverEnter}
                onMouseLeave={this.onHoverLeave}
                onClick={this.onClick}
            >
                <img src={thumbnail} />
                <input
                    type="checkbox"
                    style={{ position: "absolute", top: 0, left: 0 }}
                    disabled={this.state.isDisabled}
                    defaultChecked={isSelected}
                    checked={isSelected}
                    onClick={this.onClick}
                />
            </div>
        );
    }
}

export default PageExtractionThumbnail;
