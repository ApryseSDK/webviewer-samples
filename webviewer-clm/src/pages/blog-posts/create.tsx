import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form } from "antd";
import React from "react";
import { BlogPostFormFields } from "./form";

export const BlogPostCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <BlogPostFormFields categorySelectProps={categorySelectProps} />
      </Form>
    </Create>
  );
};
