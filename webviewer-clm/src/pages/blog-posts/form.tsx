import MDEditor from "@uiw/react-md-editor";
import { Form, Input, Select } from "antd";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

type BlogPostFormFieldsProps = {
  categorySelectProps: any;
  categoryInitialValue?: string;
};

export const BlogPostFormFields = ({
  categorySelectProps,
  categoryInitialValue,
}: BlogPostFormFieldsProps) => (
  <>
    <Form.Item
      label={"Title"}
      name={["title"]}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      label={"Content"}
      name="content"
      rules={[
        {
          required: true,
        },
      ]}
    >
      <MDEditor data-color-mode="light" />
    </Form.Item>
    <Form.Item
      label={"Category"}
      name={["category", "id"]}
      initialValue={categoryInitialValue}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select {...categorySelectProps} />
    </Form.Item>
    <Form.Item
      label={"Status"}
      name={["status"]}
      initialValue={"draft"}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Select defaultValue={"draft"} options={statusOptions} style={{ width: 120 }} />
    </Form.Item>
  </>
);
