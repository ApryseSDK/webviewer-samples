import {
  DateField,
  DeleteButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useGetIdentity, useMany } from "@refinedev/core";
import { Button, Space, Table } from "antd";
import { removeExtension } from "../../utility";
import { SignatureOutlined } from "@ant-design/icons";

export const AgreementList = () => {
  const { data: identity } = useGetIdentity<any>();

  const { result, tableProps } = useTable({
    resource: "agreements",
    syncWithLocation: true,
    meta: {
      select: "*, users!inner(first_name, last_name), templates!inner(title)",
    },
    filters: {
      permanent: [
        ...(identity?.user_metadata?.role !== "admin"
          ? [
              {
                field: "user_id",
                operator: "eq" as const,
                value: identity?.id,
              },
            ]
          : []),
      ],
    },
  });

  if (!identity) {
    return <List>Loading...</List>;
  }

  return (
    <List>
      <Table {...tableProps} rowKey="id" >
        {identity.user_metadata?.role == "admin" && 
          <Table.Column title={"User"} render={(_, record) => `${record.users?.first_name} ${record.users?.last_name}`}/>
        }
        <Table.Column title={"Agreement"}  render={(_, record) => removeExtension(record.templates?.title)}/>
        <Table.Column title={"Status"} dataIndex="status"  />
        <Table.Column
          dataIndex={"created_at"}
          title={"Created Date"}
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              {identity.user_metadata?.role == "admin" ? (
                <>
                  <ShowButton hideText size="small" recordItemId={record.id} />
                  <DeleteButton hideText size="small" recordItemId={record.id} />
                </>
              ): (record?.status == "Awaiting Signature" ? (
                  <Button 
                    size="small" 
                    icon={<SignatureOutlined />}
                    href={`/agreements/sign/${record.id}`}
                  />
              ) : (
                <ShowButton hideText size="small" recordItemId={record.id} />
              ))}

      
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
