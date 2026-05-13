import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Input, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { decode, encode } from "base64-arraybuffer";
import { wvCardProps } from "../../utility/wv.props";
import { useGetIdentity } from "@refinedev/core";

export const TemplateEdit = () => {
  const viewer = useRef<any>(null);
  const wvInstance = useRef<WebViewerInstance>(null);
  const { formProps, saveButtonProps, query, onFinish, formLoading } = useForm({});
  const [isWebViewerReady, setIsWebViewerReady] = useState(false);
  const { data: identity } = useGetIdentity<any>();


  const handleOnFinish = async (values: any) => {
    const { documentViewer } = wvInstance.current?.Core!;

    const document = documentViewer.getDocument();

    const title = document.getFilename();
    const fileData = await document.getFileData();
    const base64 = encode(fileData);

    onFinish({
      title: title,
      file_extension: title.split(".").pop(),
      file_data: base64,
    });
  };

  useEffect(() => {
    if(isWebViewerReady && identity?.user_metadata && wvInstance.current){
      const { annotationManager } = wvInstance.current.Core;
      annotationManager.setCurrentUser(identity.user_metadata.name);
    }
    
  },[isWebViewerReady, identity])


   useEffect(() => {
    if(isWebViewerReady && query?.data?.data && wvInstance.current){

      const arraybuffer = decode(query?.data?.data.file_data);
      const arr = new Uint8Array(arraybuffer);
      const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      wvInstance.current.UI.loadDocument(blob, { 
        enableOfficeEditing: true,
        filename: query?.data?.data.title,
        extension: query?.data?.data.file_extension
       });
    }
   },[isWebViewerReady, query?.data?.data])
  
    useEffect(() => {
        WebViewer(
       {
        path: "/webviewer/lib",
        enableOfficeEditing: true,
        enableFilePicker: false,
        initialMode: "docxEditor",
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
      },
      viewer.current
    ).then((instance) => {
      wvInstance.current = instance;
      setIsWebViewerReady(true);

   

    });
  }, []);

  return (
    <Edit saveButtonProps={saveButtonProps} contentProps={wvCardProps} isLoading={formLoading} >
      <Form {...formProps} onFinish={handleOnFinish}  layout="vertical" style={{
        maxHeight: 'calc(100vh - 253px)',
        display: 'flex'
      }}>
        <Flex ref={viewer} style={{flex: 1}}>
        </Flex>
      </Form>
    </Edit>
  );
};
