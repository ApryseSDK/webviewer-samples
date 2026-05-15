import { Create, useForm, useSelect } from "@refinedev/antd";
import { Flex, Form, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../utility";
import { decode, encode } from "base64-arraybuffer";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { v4 as uuidv4 } from 'uuid';

type UserSelectItem = {
    id: string;
    first_name?: string;
    last_name?: string;
};

type TemplateSelectItem = {
    id: string;
    title?: string;
};

export const AgreementCreate = () => {
    const viewer = useRef<any>(null);
    const wvInstance = useRef<WebViewerInstance | null>(null);

    const [loading, setLoading] = useState(false);
    const { formProps, saveButtonProps, onFinish } = useForm({});

    const { selectProps: users } = useSelect<UserSelectItem>({
        resource: "users",
        optionLabel: (item) => `${item?.first_name} ${item?.last_name}`,
        optionValue: "id"
    });

    const { selectProps: templates } = useSelect<TemplateSelectItem>({
        resource: "templates",
        optionLabel: (item) => item?.title ?? "",
        optionValue: "id"
    });

   const handleOnFinish = async (formData: any) => {
        setLoading(true)

        let fileData;
        let userData;
        {
            const { data, error} = await supabaseClient 
                .from('templates')
                .select('file_data')
                .eq('id',formData.template_id)
                .limit(1)
                .maybeSingle()
            
            if(error){
                alert("Failed to find template")
            }

            fileData = data;
        }

        {
            const { data, error} = await supabaseClient 
                .from('users')
                .select('first_name, last_name, address')
                .eq('id',formData.user_id)
                .limit(1)
                .maybeSingle()
            
            if(error){
                alert("Failed to find user")
            }

            userData = data;
        }

        const instance = wvInstance.current;
        if (!instance) {
            setLoading(false);
            return;
        }
        const { Core } = instance;
        const { PDFNet, Math: PDFNetMath, Annotations } = Core;
        const { WidgetFlags } = Annotations;
        await PDFNet.initialize()

        const arraybuffer = decode(fileData?.file_data);
        const arr = new Uint8Array(arraybuffer);
        const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        const doc = await Core.createDocument(blob, {extension: 'docx'});

        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
        const formattedDate = formatter.format(date)

        const jsonData = {
            date: formattedDate,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            address: userData?.address,
            company_address: "555 Burrard St, Vancouver, BC V7X 1M7"
        }
        await doc.applyTemplateValues(jsonData);
        
        const pdfData = await doc.getFileData({
            downloadType: 'pdf'
        })

        const txtSearch = await PDFNet.TextSearch.create();
        const document = await PDFNet.PDFDoc.createFromBuffer(pdfData);
        if (!document) {
            setLoading(false);
            return;
        }
        const replacer = await PDFNet.ContentReplacer.create();

        const pattern = '\\[.*?\]';
        const mode = PDFNet.TextSearch.Mode.e_whole_word | PDFNet.TextSearch.Mode.e_reg_expression | PDFNet.TextSearch.Mode.e_highlight;

        txtSearch?.begin(document, pattern, mode);

        let result = await txtSearch?.run();

        while(true){
            if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
                let highlights = result.highlights;

                highlights.begin(document);
                let quad = (await highlights.getCurrentQuads())[0];
                var mathRect = new PDFNetMath.Quad(quad?.p1x, quad?.p1y, quad?.p2x, quad?.p2y, quad?.p3x, quad?.p3y, quad?.p4x, quad?.p4y).toRect();
                var rect = new  PDFNet.Rect(mathRect.x1, mathRect.y1, mathRect.x2, mathRect.y2);
    
                await replacer.addString(result.out_str.slice(1,-1), '');
                const page = await document.getPage(result?.page_num)

                const flags = new WidgetFlags();
                flags.set(WidgetFlags.REQUIRED, true);

                const signatureField = await document.fieldCreate(
                    uuidv4().toString(),
                    PDFNet.Field.Type.e_signature
                );

                const signature = await PDFNet.SignatureWidget.createWithField(
                    document,
                    rect,
                    signatureField
                );

                await signature.refreshAppearance();

                page.annotPushBack(signature);
                await replacer.process(page);
            } else if (result.code ===  PDFNet.TextSearch.ResultCode.e_done) {
              break;
            }
            result = await txtSearch.run();
        }
    
        const buffer = await document.saveMemoryBuffer(Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
        const normalizedBuffer = buffer instanceof Uint8Array
            ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
            : buffer;
        if (!(normalizedBuffer instanceof ArrayBuffer)) {
            setLoading(false);
            return;
        }
        const base64 = encode(normalizedBuffer);

        onFinish({
            ...formData,
            file_data: base64,
        })
        .finally(() => setLoading(false));
   }

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        fullAPI: true,
        licenseKey: "YOUR_LICENSE_KEY"
      },
      viewer.current
    ).then((instance) => {
      wvInstance.current = instance;

    });
  }, []);

  return (
    <Create saveButtonProps={{...saveButtonProps, children: "Create"}} isLoading={loading}>
    <Form {...formProps} onFinish={handleOnFinish}  layout="vertical">
        <Flex flex={1}>
            <Form.Item
            style={{flex: 1}}
            label={"User"}
            name={"user_id"}
            rules={[
                {
                required: true,
                },
            ]}
            >
            <Select {...users} />
            </Form.Item>
            <Form.Item
                style={{flex: 1, marginLeft: 30}}
                label={"Template"}
                name={"template_id"}
                rules={[
                    {
                    required: true,
                    },
                ]}
                >
            <Select {...templates} />
            </Form.Item>
        </Flex>
        <div ref={viewer} style={{visibility: 'hidden', height: 0}}></div>
    </Form>
      
    </Create>
  );
};
