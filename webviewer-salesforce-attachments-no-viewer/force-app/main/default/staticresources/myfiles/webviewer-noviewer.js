const getWindowHash = () => {
    const url = window.location.href;
    const i = url.indexOf('#');
    return (i >= 0 ? url.substring(i + 1) : '');
};
  
  var resourceURL = '/resource/';
  var params = getWindowHash(); // parse url parameters
  var json = params.split('=')[1];
  
  var clientSidePdfGenerationConfig = JSON.parse(decodeURI(json))
  
  var script = document.createElement('script');
  script.onload = async function () {
    init();
    var pdfnet = document.createElement('script');
    pdfnet.src = clientSidePdfGenerationConfig['pdfnet'];
    document.head.appendChild(pdfnet);
  };
  script.src = clientSidePdfGenerationConfig['cs_pdftron_core'];
  document.head.appendChild(script);


  
  function init() {
    console.log(`%c initialize Core `, 'background: red; color: white;');
    

    window.Core.forceBackendType('ems');


    window.Core.setOfficeAsmPath(resourceURL + 'office_asm');
    window.Core.setOfficeWorkerPath(resourceURL + 'office');
    window.Core.setOfficeResourcePath(resourceURL + 'office_resource');

    // pdf workers
    window.Core.setPDFResourcePath(resourceURL + 'resource');
    if (clientSidePdfGenerationConfig['full_api']) {
      window.Core.setPDFWorkerPath(resourceURL + 'pdf_full');
    } else {
      window.Core.setPDFWorkerPath(resourceURL + 'pdf_lean');
    }

    // external 3rd party libraries
    window.Core.setExternalPath(resourceURL + 'external');
    window.Core.disableEmbeddedJavaScript(true)

    window.Core.enableOptimizedWorkers();

  
      
  
  
      // setInterval(() => {
      //   console.log(`%c Post message back to parent `, 'background: green; color: white;');
      //   parent.postMessage({type: 'MESSAGE_FOR_LWC_COMPONENT', payload: 'foo bar'}, '*')
      // }, 5000)
  
  
      window.addEventListener("message", receiveMessage, false);
  
      function receiveMessage(event) {
        if (event.isTrusted && typeof event.data === 'object') {
          switch (event.data.type) {
            case 'DOWNLOAD_DOCUMENT':
              transportDocument(event.data.payload, false)
              break;
            default:
              break;
          }
        }
      }
  }


  function transportDocument(payload, transport){
    switch (payload.exportType) {
      case 'jpg':
      case 'png':
        // PDF to Image (png, jpg)
        pdfToImage(payload, transport);
        break;
      case 'pdf':
        // DOC, Images to PDF
        toPdf(payload, transport);
        break;
    }
  }
  
  // Basic function that retrieves any viewable file from the viewer and downloads it as a pdf
  async function toPdf (payload) {
      let file = payload.file;
  
      parent.postMessage({ type: 'DOWNLOAD_DOCUMENT', file }, '*');
      instance.downloadPdf({filename: payload.file});
  
  }
  
  
  
  const pdfToImage = async (payload, transport) => {
  
    await PDFNet.initialize();
  
    let doc = null;
  
    await PDFNet.runWithCleanup(async () => {
  
      const buffer = await payload.blob.arrayBuffer();
      doc = await PDFNet.PDFDoc.createFromBuffer(buffer);
      doc.initSecurityHandler();
      doc.lock();
  
      const count = await doc.getPageCount();
      const pdfdraw = await PDFNet.PDFDraw.create(92);
      
      let itr;
      let currPage;
      let bufferFile;
  
      // Handle multiple pages
      for (let i = 1; i <= count; i++){
  
        itr = await doc.getPageIterator(i);
        currPage = await itr.current();
        bufferFile = await pdfdraw.exportStream(currPage, payload.exportType.toUpperCase());
        transport ? saveFile(bufferFile, payload.file, "." + payload.exportType) : downloadFile(bufferFile, payload.file, "." + payload.exportType);
  
      }
  
    }); 
  
  }
  
  
  
  
  // Master download method
  const downloadFile = (buffer, fileName, fileExtension) => {
    const blob = new Blob([buffer]);
    const link = document.createElement('a');
  
    const file = fileName + fileExtension;
    // create a blobURI pointing to our Blob
    link.href = URL.createObjectURL(blob);
    link.download = file
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
  
  
    parent.postMessage({ type: 'DOWNLOAD_DOCUMENT', file }, '*')
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    
  };
