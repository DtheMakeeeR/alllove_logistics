import React from "react";
import { useTable } from "@refinedev/antd";
import { Table, Space, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router";

export const UsersList: React.FC = () => {
  const { tableProps } = useTable({ resource: "users" });

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/users/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать пользователя
          </Button>
        </Link>
      </Space>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="full_name" title="ФИО" />
        <Table.Column dataIndex="role" title="Роль" />
        <Table.Column
          dataIndex="is_active"
          title="Активен"
          render={(v: boolean) => (v ? "Да" : "Нет")}
        />
      </Table>
    </>
  );
};