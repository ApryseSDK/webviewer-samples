import React, { createElement } from "react";
import ListItem from "./ListItem";

interface VirtualListInputProps {
    items: any[];
    padding: number;
    render: any;
    height: string | number;
}

class VirtualList extends React.Component<VirtualListInputProps> {
    private _scrollContainerRef: React.RefObject<HTMLDivElement>;
    private _eventListeners: Record<string, any[]>;
    constructor(props: VirtualListInputProps) {
        super(props);
        this._scrollContainerRef = React.createRef();
        this._eventListeners = {};
    }
    componentDidMount(): void {
        this.trigger("mount", this._scrollContainerRef.current?.getBoundingClientRect());
    }
    addEventListener = (event: string, handler: any): void => {
        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }
        if (handler) {
            this._eventListeners[event].push(handler);
        }
    };
    removeEventListener = (event: string, handler: any): void => {
        if (!handler || !this._eventListeners[event]) {
            return;
        }
        this._eventListeners[event] = this._eventListeners[event].reduce((acc, existingHandler) => {
            if (existingHandler !== handler) {
                acc.push(existingHandler);
            }
            return acc;
        }, []);
    };
    trigger = (event: string, ...parameters: any[]): void => {
        if (!this._eventListeners[event]) {
            return;
        }
        this._eventListeners[event].forEach(handler => handler(...parameters));
    };
    onScroll = (): void => {
        this.trigger(
            "scroll",
            this._scrollContainerRef.current?.getBoundingClientRect(),
            this._scrollContainerRef.current?.scrollTop,
            this.props.padding
        );
    };
    render(): JSX.Element {
        return (
            <div
                ref={this._scrollContainerRef}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gridTemplateRows: "1fr",
                    width: "100%",
                    overflow: "auto",
                    height: this.props.height
                }}
                onScroll={this.onScroll}
            >
                {this.props.items.map((item, i) => (
                    <ListItem
                        key={i}
                        item={item}
                        render={this.props.render}
                        parentAddEventListener={this.addEventListener}
                        parentRemoveEventListener={this.removeEventListener}
                        parentTrigger={this.trigger}
                    />
                ))}
            </div>
        );
    }
}

export default VirtualList;
