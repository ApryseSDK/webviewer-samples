import React, { createElement } from "react";

interface ListItemInputProps {
    item: any;
    render: any;
    parentAddEventListener: any;
    parentRemoveEventListener: any;
    parentTrigger: any;
}

interface ListItemState {
    renderTarget: any;
    shouldRenderItem: boolean;
    isVisible: boolean;
    height: number;
}

const DEFAULT_MAX_HEIGHT = 153;

class ListItem extends React.Component<ListItemInputProps, ListItemState> {
    private static MAX_HEIGHT = DEFAULT_MAX_HEIGHT;
    private _containerRef: React.RefObject<HTMLDivElement>;
    private _measurementRef: React.RefObject<HTMLDivElement>;
    private _resizeObserver: ResizeObserver;
    private _scrollHandle: any;
    constructor(props: ListItemInputProps) {
        super(props);
        this._containerRef = React.createRef();
        this._measurementRef = React.createRef();
        this._resizeObserver = new ResizeObserver(() => {
            const rect = this._measurementRef.current?.getBoundingClientRect();
            if (!rect || rect.height === 0 || rect.height < ListItem.MAX_HEIGHT) {
                return;
            }
            if (rect.height >= ListItem.MAX_HEIGHT) {
                ListItem.MAX_HEIGHT = rect.height;
                this.props.parentTrigger("maxHeightUpdate", rect.height);
            }
            this.setState({ height: rect.height >= ListItem.MAX_HEIGHT ? rect.height : ListItem.MAX_HEIGHT });
        });
        this.props.parentAddEventListener("maxHeightUpdate", this.onMaxHeightUpdate);
        this.props.parentAddEventListener("scroll", this.onParentScroll);
        const renderTarget = this.props.render(this.props.item);
        const isPromise = renderTarget instanceof Promise;
        if (isPromise) {
            renderTarget.then((result: any) => this.setState({ renderTarget: result, shouldRenderItem: true }));
        }
        this.state = {
            renderTarget: isPromise ? undefined : renderTarget,
            shouldRenderItem: !isPromise,
            height: 0,
            isVisible: true
        };
    }
    componentDidMount(): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._resizeObserver.observe(this._measurementRef.current);
    }
    componentWillUnmount(): void {
        if (this._measurementRef.current) {
            this._resizeObserver.unobserve(this._measurementRef.current);
        }
        this.props.parentRemoveEventListener("scroll", this.onParentScroll);
        ListItem.MAX_HEIGHT = DEFAULT_MAX_HEIGHT;
    }
    onMaxHeightUpdate = (maxHeight: number) => {
        if (!this.state.isVisible && this.state.height < maxHeight) {
            this.setState({ height: maxHeight });
        }
    };
    onParentScroll = (parentRect: any, _scrollTop: number, padding: number) => {
        clearTimeout(this._scrollHandle);
        this._scrollHandle = setTimeout(() => {
            const rect = this._containerRef.current?.getBoundingClientRect();
            if (this.doRectanglesIntersect(parentRect, rect, padding)) {
                this.setState({ isVisible: true });
            } else {
                this.setState({ isVisible: false });
            }
        }, 100);
    };
    doRectanglesIntersect = (rect1: any, rect2: any, padding = 13): boolean => {
        const itemPadding = ListItem.MAX_HEIGHT * padding;
        const rect1Top = rect1.y - itemPadding;
        const rect1Bottom = rect1.y + rect1.height + itemPadding;
        const rect2Top = rect2.y;
        const rect2Bottom = rect2.y + rect2.height;

        const verticalIntersection = rect1Top < rect2Bottom && rect1Bottom > rect2Top;

        return verticalIntersection;
    };
    // eslint-disable-next-line no-undef
    render(): JSX.Element {
        if (!this.state.shouldRenderItem) {
            return <></>;
        }
        return (
            <div
                key={this.props.item}
                ref={this._containerRef}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.5em 0px"
                    // DEBUGGING ONLY
                    // ,backgroundColor: this.state.isVisible ? "green" : "red"
                }}
            >
                <div ref={this._measurementRef}>
                    <div
                        style={{
                            display: this.state.isVisible ? undefined : "none",
                            height: `${
                                ListItem.MAX_HEIGHT < this.state.height ? this.state.height : ListItem.MAX_HEIGHT
                            }px`
                        }}
                    >
                        {this.state.renderTarget}
                    </div>
                    <div
                        style={{
                            display: !this.state.isVisible ? undefined : "none",
                            height: `${
                                ListItem.MAX_HEIGHT < this.state.height ? this.state.height : ListItem.MAX_HEIGHT
                            }px`
                        }}
                    ></div>
                </div>
            </div>
        );
    }
}

export default ListItem;
