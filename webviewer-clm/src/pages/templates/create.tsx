import { Create, useForm } from "@refinedev/antd";
import { Flex, Form } from "antd";
import React, { useEffect, useRef, useState } from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { encode } from "base64-arraybuffer";
import { wvCardProps } from "../../utility/wv.props";
export const TemplateCreate = () => {
  const viewer = useRef<any>(null);
  const wvInstance = useRef<WebViewerInstance>(null);
  const { formProps, saveButtonProps, onFinish } = useForm({});
  const [loading, setLoading] = useState(true);

  const handleOnFinish = async () => {
    const documentViewer = wvInstance.current?.Core?.documentViewer;
    if (!documentViewer) {
      return;
    }

    const document = documentViewer.getDocument();
    if (!document) {
      return;
    }
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
    WebViewer(
      {
        path: "/webviewer/lib",
        enableOfficeEditing: true,
        enableFilePicker: true,
        initialMode: "docxEditor",
        licenseKey: "YOUR_LICENSE_KEY",
      },
      viewer.current
    ).then((instance) => {
      wvInstance.current = instance;

      instance.Core.documentViewer.addEventListener("documentLoaded", () => {
        setLoading(false);
      });

    });
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps} contentProps={wvCardProps} isLoading={loading}>
      <Form {...formProps} onFinish={handleOnFinish} layout="vertical" style={{
        maxHeight: 'calc(100vh - 253px)',
        display: 'flex'
      }}>
        <Flex ref={viewer} style={{flex: 1}}></Flex>
      </Form>
    </Create>
  );
};
