import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

const Dropzone = () => {
  const dropRef = useRef(null);
  const [docs, addDocument] = useState([]);
  const [thumbArray, addThumbToArray] = useState([]);

  useEffect(() => {
    if (docs.length >= 1) {
      const Core = window.instance.Core;
      const loadDocumentAndThumb = async () => {
        const doc = await Core.createDocument(docs[docs.length - 1]);
        doc.loadThumbnail(1, (thumbnail) => {
          addThumbToArray([...thumbArray, thumbnail]);
        });
      }
      loadDocumentAndThumb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  const mergeDocuments = async () => {
    const Core = window.instance.Core;
    if (docs.length > 0) {
      const doc = await Core.createDocument(docs[0]);
      let i;
      for (i = 1; i < docs.length; i++) {
        let doc2 = await Core.createDocument(docs[i]);
        await doc.insertPages(doc2);
      }

      const data = await doc.getFileData();
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      downloadBlob(blob);
    }
    addDocument([]);
    addThumbToArray([]);
  };

  const downloadBlob = (blob) => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'merged-file.pdf';
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  };

  const onDropEvent = (ev) => {
    ev.preventDefault();
    const viewerID = ev.dataTransfer.getData('dataTransferWebViewerFrame');
    const otherWebViewerIframe = window.parent.document.querySelector(
      `#${viewerID}`,
    );
    if (!otherWebViewerIframe) {
      console.warn('Could not find other instance of WebViewer');
    }

    const extractedDataPromise =
      otherWebViewerIframe.contentWindow.extractedDataPromise;
    if (!extractedDataPromise) {
      console.warn('Could not retrieve data from other instance of WebViewer');
    }

    extractedDataPromise.then(docToMerge => {
      addDocument([...docs, docToMerge]);
    });
  };

  return (
    <div>
      <div
        className="dropDiv"
        ref={dropRef}
        onDrop={ev => {
          onDropEvent(ev);
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = 'move';
        }}
      >
        <p>Drop the thumbs from the viewers here</p>
        <button onClick={mergeDocuments}>Download</button>
      </div>
      <div className="list">
        {thumbArray.map((thumb, i) => {
          return <img key={i} src={thumb.toDataURL()} alt={i} />
        })}
      </div>
    </div>
  );
};

export default Dropzone;
