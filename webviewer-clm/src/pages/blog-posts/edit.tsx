import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form } from "antd";
import React from "react";
import { BlogPostFormFields } from "./form";

export const BlogPostEdit = () => {
  const { formProps, saveButtonProps, query, formLoading } = useForm({});

  const blogPostsData = query?.data?.data;

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    defaultValue: blogPostsData?.category,
    queryOptions: {
      enabled: !!blogPostsData?.category,
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <BlogPostFormFields
          categorySelectProps={categorySelectProps}
          categoryInitialValue={formProps?.initialValues?.category?.id}
        />
      </Form>
    </Edit>
  );
};
