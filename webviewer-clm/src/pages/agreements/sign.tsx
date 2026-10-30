import { Edit, Show, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Input, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { wvCardProps } from "../../utility/wv.props";
import { useShow, useUpdate } from "@refinedev/core";
import { useParams } from "react-router";
import { decode, encode } from "base64-arraybuffer";

export const AgreementSign = () => {
  const viewer = useRef<any>(null);
  const wvInstance = useRef<WebViewerInstance | null>(null);
  const [isWebViewerReady, setIsWebViewerReady] = useState(false);
  const { id } = useParams();

  const {
    query: { data, isLoading },
  } = useShow({
    resource: "agreements",
    id: id,
  });

    const { mutate, mutation } = useUpdate({
        resource: "agreements",
    });


  useEffect(() => {
    if (data && isWebViewerReady && wvInstance.current) {
      const { UI } = wvInstance.current;

      const arraybuffer = decode(data?.data?.file_data);
      const arr = new Uint8Array(arraybuffer);
      const blob = new Blob([arr], { type: "application/pdf" });

      UI.loadDocument(blob, {
        extension: "pdf",
      });
    }
  }, [data, isWebViewerReady]);

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        enableFilePicker: false,
      },
      viewer.current
    ).then((instance) => {
      wvInstance.current = instance;
      setIsWebViewerReady(true);
    });
  }, []);

  const handleSave = async () => {
    const core = wvInstance.current?.Core;
    if (!core) {
      return;
    }
    const { documentViewer, annotationManager } = core;

    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({
        xfdfString
    });
    const base64 = encode(data);
    mutate({
        id: id,
        values: {
            file_data: base64,
            status: "Signed",
        },
    });
  }

  return (
    <Edit title={"Agreement"} contentProps={wvCardProps} isLoading={isLoading}  
      saveButtonProps={{
        onClick: handleSave,
        loading: mutation.isPending,
      }}>
      <Flex
        style={{
          height: "calc(100vh - 253px)",
          display: "flex",
        }}
      >
        <div ref={viewer} style={{ flex: 1 }}></div>
      </Flex>
    </Edit>
  );
};
