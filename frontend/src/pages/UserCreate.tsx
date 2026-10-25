import React from "react";
import { useForm } from "@refinedev/antd";
import { Form, Input, Select, Button, Card, message } from "antd";
import { useNavigate } from "react-router";

export const UserCreate: React.FC = () => {
  const navigate = useNavigate();

  const { onFinish, formProps } = useForm({
    resource: "users",
    action: "create",
    onMutationSuccess: () => {
      message.success("Пользователь создан");
      navigate("/users");
    },
  });

  return (
    <Card title="Создание пользователя" style={{ maxWidth: 600 }}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Введите корректный email" }]}
        >
          <Input placeholder="user@alllove.ru" />
        </Form.Item>
        <Form.Item
          label="ФИО"
          name="full_name"
          rules={[{ required: true, min: 2, message: "Минимум 2 символа" }]}
        >
          <Input placeholder="Иванов Иван Иванович" />
        </Form.Item>
        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, min: 6, message: "Минимум 6 символов" }]}
        >
          <Input.Password placeholder="Минимум 6 символов" />
        </Form.Item>
        <Form.Item
          label="Роль"
          name="role"
          initialValue="client"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "client", label: "Клиент (сотрудник шоурума)" },
              { value: "validator", label: "Валидатор" },
              { value: "admin", label: "Администратор" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Создать
        </Button>
      </Form>
    </Card>
  );
};