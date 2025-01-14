import React, { useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import './barcode.css';

const Barcode = ({ instance }) => {
  const barcodeRef = useRef(null);
  const qrRef = useRef(null);
  const formatRef = useRef(null);

  const [errText, setErrText] = useState('');
  const [errQrText, setErrQrText] = useState('');
  const [qrInput, setQrInput] = useState('');


  const stampBarcode = (e, type) => {
    e.preventDefault();
    const { Annotations, annotationManager, documentViewer } = instance.Core;
    const stampAnnot = new Annotations.StampAnnotation();
    stampAnnot.PageNumber = documentViewer.getCurrentPage();
    stampAnnot.X = 100;
    stampAnnot.Y = 250;
    stampAnnot.Width = 300;
    
    if (type === '2d') {
      stampAnnot.setImageData(barcodeRef.current.toDataURL());
      stampAnnot.Height = 200;
    } else {
      stampAnnot.setImageData(qrRef.current.toDataURL());
      stampAnnot.Height = 300;
    }

    stampAnnot.Author = annotationManager.getCurrentUser();
    annotationManager.addAnnotation(stampAnnot);
    annotationManager.redrawAnnotation(stampAnnot);
  };

  return (
    <div className="barcodeContainer">
      <h1>Barcode Generator</h1>
      <h2>2D Barcode</h2>
      <select id="barcodeType" title="CODE128" ref={formatRef}>
        <option value="CODE128">CODE128 auto</option>
        <option value="CODE128A">CODE128 A</option>
        <option value="CODE128B">CODE128 B</option>
        <option value="CODE128C">CODE128 C</option>
        <option value="EAN13">EAN13</option>
        <option value="EAN8">EAN8</option>
        <option value="UPC">UPC</option>
        <option value="CODE39">CODE39</option>
        <option value="ITF14">ITF14</option>
        <option value="ITF">ITF</option>
        <option value="MSI">MSI</option>
        <option value="MSI10">MSI10</option>
        <option value="MSI11">MSI11</option>
        <option value="MSI1010">MSI1010</option>
        <option value="MSI1110">MSI1110</option>
        <option value="pharmacode">Pharmacode</option>
      </select>
      <input
        onChange={e => {
          try {
            setErrText('');
            JsBarcode(barcodeRef.current, e.currentTarget.value, {
              format: formatRef.current.value,
            });
          } catch (err) {
            setErrText(err);
          }
        }}
        type="text"
      ></input>
      <button
        onClick={e => {
          stampBarcode(e, '2d');
        }}
      >
        Stamp on a PDF
      </button>
      <div className="error">{errText}</div>
      <canvas className="barcodeCanvas" ref={barcodeRef}></canvas>

      <h2>QR Code</h2>
      <input
        onChange={e => {
          setErrQrText('');
          setQrInput(e.currentTarget.value);
        }}
        type="text"
      ></input>
      <button
        onClick={e => {
          if (!qrInput) {
            setErrQrText('Please enter a value');
            return;
          }
          QRCode.toCanvas(qrRef.current, qrInput, function (error) {
            if (error) setErrQrText(error);
          });
        }}
      >
        Generate QR
      </button>
      <button
        onClick={e => {
          stampBarcode(e, 'qr');
        }}
      >
        Stamp on a PDF
      </button>
      <div className="error">{errQrText}</div>
      <canvas className="qrCanvas" ref={qrRef}></canvas>
    </div>
  );
};

export default Barcode;
