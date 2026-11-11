import { Edit, Show, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Input, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { decode, encode } from "base64-arraybuffer";
import { wvCardProps } from "../../utility/wv.props";
import { useShow } from "@refinedev/core";

export const AgreementShow = () => {
  const viewer = useRef<any>(null);
  const wvInstance = useRef<WebViewerInstance>(null);
 const [isWebViewerReady, setIsWebViewerReady] = useState(false);

  const {
    result: record,
    query: { isLoading },
  } = useShow({});

   useEffect(() => {
    if(isWebViewerReady && record && wvInstance.current){
      const { UI } = wvInstance.current;

      const arraybuffer = decode(record.file_data);
      const arr = new Uint8Array(arraybuffer);
      const blob = new Blob([arr], { type: 'application/pdf' });

      UI.loadDocument(blob, { 
          extension: 'pdf',
      });
    }
   },[record, isWebViewerReady])
  
    useEffect(() => {
        WebViewer(
       {
        path: "/webviewer/lib",
        enableFilePicker: false,
      },
      viewer.current
    ).then((instance) => {
        instance.UI.enableViewOnlyMode();
        wvInstance.current = instance;
        setIsWebViewerReady(true);
    });
  }, []);

  return (
    <Show title={'Agreement'} contentProps={wvCardProps} isLoading={isLoading} >
      <Flex  style={{
        height: 'calc(100vh - 253px)',
        display: 'flex'}}>
          <div ref={viewer} style={{flex: 1}}></div>
      </Flex>
    </Show>
  );
};
