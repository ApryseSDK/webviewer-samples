import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import { DatePicker, Flex, Form, Input, Select, Space } from "antd";
import React, { useEffect } from "react";
import dayjs from 'dayjs';

export const UserEdit = () => {
  const { formProps, saveButtonProps, query, onFinish, formLoading } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Flex flex={1}>
            <Form.Item
            style={{flex: 1}}
            label={"First name"}
            name={["first_name"]}
            initialValue={"first_name"}
            rules={[
                {
                required: true,
                },
            ]}>
            <Input />
            </Form.Item>
            <Form.Item
            style={{flex: 1, marginLeft: 30}}
            label={"Last name"}
            name={["last_name"]}
            initialValue={"last_name"}
            rules={[
                {
                required: true,
                },
            ]}>
            <Input />
            </Form.Item>
        </Flex>
        <Flex flex={1}>
        <Form.Item
            style={{flex: 1}}
            label={"Email address"}
            name={["email_address"]}>
            <Input disabled/>
            </Form.Item>

        </Flex>
        <Form.Item
            label={"Address"}
            name={["address"]}
            initialValue={"address"}
            rules={[
                {
                required: true,
                },
            ]}>
             <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
