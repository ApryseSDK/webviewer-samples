import { Create, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Input, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import Dragger from "antd/lib/upload/Dragger";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { encode } from "base64-arraybuffer";
import { wvCardProps } from "../../utility/wv.props";
export const TemplateCreate = () => {
  const viewer = useRef<any>(null);
  const wvInstance = useRef<WebViewerInstance>(null);
  const { form, formProps, saveButtonProps, onFinish } = useForm({});
  const [loading, setLoading] = useState(true);

  const handleOnFinish = async () => {
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
    WebViewer(
      {
        path: "/webviewer/lib",
        enableOfficeEditing: true,
        enableFilePicker: true,
        initialMode: "docxEditor",
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
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
