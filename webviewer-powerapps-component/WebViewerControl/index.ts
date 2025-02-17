import { IInputs, IOutputs } from "./generated/ManifestTypes";
import WebViewer from '@pdftron/webviewer'

export class WebViewerControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _notifyOutputChanged: () => void;
    private pdfURI = "";
    private iframeWindow: Window;
    private _context: ComponentFramework.Context<IInputs>;
    private _container: HTMLDivElement;

    constructor() {
        // Empty constructor
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        // Add control initialization code
        this._notifyOutputChanged = notifyOutputChanged;
        this._context = context;

        const viewerElement = document.createElement("div");
        viewerElement.style.height = context.parameters.viewerheight.raw + "px";
        viewerElement.style.width = context.parameters.viewerwidth.raw + "px";
        this._container = viewerElement;
        container.appendChild(this._container);

        viewerElement.addEventListener('ready', () => {
            this.iframeWindow = viewerElement.querySelector('iframe')!.contentWindow!;
        })

        WebViewer.Iframe({
            path: 'http://localhost:3000/lib',
            config: 'http://localhost:3000/config.js',
            initialDoc: context.parameters.doc.raw!,
        }, viewerElement)

        window.addEventListener("message", (event: MessageEvent) => {
            if (event.isTrusted && typeof event.data === 'object') {
                switch (event.data.type) {
                    case 'SAVE_DOCUMENT':
                        this.handleDocSave(event.data.payload.file);
                        break;
                    default:
                        break;
                }
            }
        }, false);
    }

    private handleDocOpen(docUrl: string): void {
        const payload = {
            file: docUrl
        };
        this.iframeWindow.postMessage({ type: 'OPEN_DOCUMENT', payload }, '*');
    }

    private handleDocSave(docUrl: string): void {
        this.pdfURI = docUrl;
        this._notifyOutputChanged()
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._container.style.height = context.parameters.viewerheight.raw + "px";
        this._container.style.width = context.parameters.viewerwidth.raw + "px";
        if (context.updatedProperties.indexOf("doc") > -1) {
            this._context = context;
            this.handleDocOpen(context.parameters.doc.raw!)
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        const result = {
            pdfdoc: this.pdfURI
        };
        return result;
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
