import { Create, useForm, useSelect } from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import { DatePicker, Flex, Form, Input, Select, Space } from "antd";
import React from "react";
import { supabaseClient } from "../../utility";

export const UserCreate = () => {
  const { formProps, saveButtonProps, onFinish } = useForm({});

  const handleOnFinish = async (formData: any) => {
    const { data, error } = await supabaseClient.auth.admin.createUser({
      email: formData.email_address,
      password: '123456',
    });

    console.log(data)

    if(error){
      alert(error.message);
      return;
    }

    onFinish({
      ...formData,
      id: data.user.id
    });
  }

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} onFinish={handleOnFinish} layout="vertical">
        <Flex flex={1}>
            <Form.Item
            style={{flex: 1}}
            label={"First name"}
            name={["first_name"]}
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
            name={["email_address"]}
            rules={[
                {
                required: true,
                },
            ]}>
            <Input />
            </Form.Item>

        </Flex>
        <Form.Item
            label={"Address"}
            name={["address"]}
            rules={[
                {
                required: true,
                },
            ]}>
             <Input />
        </Form.Item>
        <Form.Item
            label={"Date of birth"}
            name={["date_of_birth"]}
            rules={[
                {
                required: true,
                },
            ]}>
             <DatePicker />
        </Form.Item>
      </Form>
    </Create>
  );
};
