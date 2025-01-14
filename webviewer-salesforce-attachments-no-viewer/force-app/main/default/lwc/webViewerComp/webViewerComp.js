import { LightningElement, track, wire } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import { CurrentPageReference } from 'lightning/navigation'
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub'
import libUrl from "@salesforce/resourceUrl/lib";
import myfilesUrl from "@salesforce/resourceUrl/myfiles";
import mimeTypes from './mimeTypes'

var url = myfilesUrl + "/webviewer-demo-annotated.pdf";

var webviewerConstructor = {
  cs_pdftron_core: libUrl + "/core/webviewer-core.min.js",
  pdfnet: myfilesUrl + "/PDFNet.js",
  full_api: true
};

function _base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export default class WebViewerComp extends LightningElement {
  @wire(CurrentPageReference) pageRef
  payload;


  connectedCallback() {
    registerListener('blobSelected', this.handleBlobSelected, this);
    registerListener('transport_document', this.handleConvertSelected, this);
    window.addEventListener("message", this.handleReceiveMessage.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.handleReceiveMessage, true);
  }

  handleReceiveMessage(event) {
    if (event.isTrusted && typeof event.data === "object") {
      switch (event.data.type) {
        case 'DOWNLOAD_DOCUMENT':
          const body = event.data.file + ' Downloaded';
          fireEvent(this.pageRef, 'finishConvert', '');
          this.showNotification('Success', body, 'success');
          break;
        default:
          break;
      }
    }
  }

  handleBlobSelected(record) {
    const blobby = new Blob([_base64ToArrayBuffer(record.body)], {
      type: mimeTypes[record.FileExtension]
    });

    const payload = {
      blob: blobby,
      extension: record.cv.FileExtension,
      file: record.cv.Title,
      filename: record.cv.Title + "." + record.cv.FileExtension,
      documentId: record.cv.Id
    };

    this.payload = {...payload};
    console.log(this.payload);
    
  }

  handleConvertSelected(convert) {
    if(this.payload != null){
      const payload = {...this.payload};
      payload.exportType = convert.value;
      payload.transport = convert.transport;


      if(convert.conform){
        payload.conformType = convert.conform;
        this.iframeWindow.postMessage({type: convert.transport, payload }, '*');
      } else {
        this.iframeWindow.postMessage({type: convert.transport, payload }, '*');
      }
      
    } else {
      console.log('No file selected');
    }
  }

  renderedCallback() {
    if (this.uiInitialized) {
      return;
    }

    this.uiInitialized = true;


    Promise.all([
      loadScript(this, libUrl + '/webviewer.min.js')
    ])
      .then(() => {
        this.initUI();
      })
      .catch(console.error);
  }

  async initUI() {
    const viewerElement = this.template.querySelector("div");

    var queryParameter = `#param=${JSON.stringify(
      webviewerConstructor
    )}`;

    var rcFrame = document.createElement("iframe");
    rcFrame.style = "position: absolute; width:0; height:0; border:0;";


    rcFrame.src = `${myfilesUrl}/noviewer.html${queryParameter}`;
    viewerElement.appendChild(rcFrame);
    this.iframeWindow = rcFrame.contentWindow;
  }
}
