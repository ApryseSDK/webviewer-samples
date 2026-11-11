import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table } from "antd";
import React from "react";

export const TemplateList = () => {
  const { result, tableProps } = useTable({
    resource: "templates",
    syncWithLocation: true,
  });

  const removeExtension = (filename: string) => {
    return filename?.replace(/\.[^/.]+$/, "") || filename;
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="title" title={"Title"} render={(value: string) => removeExtension(value)}/>
        <Table.Column
            dataIndex={["created_at"]}
            title={"Created Date"}
            render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
