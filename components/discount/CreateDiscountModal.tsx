import { Invoice } from "@prisma/client";
import { DatePicker, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import CustomerSearch from "../common/CustomerSearch";

function createDiscount(params: Invoice) {
  return fetch("/api/discount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export default function CreateDiscountModal({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      title="创建折扣"
      visible={visible}
      onCancel={onCancel}
      onOk={async () => {
        const formValue = form.getFieldsValue();
        console.log("create discoutn", formValue);
        await createDiscount({
          ...formValue,
          dueDate: formValue.expiryDate?.toISOString(),
        });
        onCancel();
      }}
    >
      <div>
        <Form layout="vertical" form={form}>
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="客户" name="customerId">
            <div style={{ width: "50%" }}>
              <CustomerSearch
                onChange={(customer) => {
                  console.log("customer selected", customer);
                  if (customer) {
                    form.setFieldsValue({ customerId: customer.id });
                  }
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="金额" name="amount">
            <InputNumber style={{ width: "50%" }} />
          </Form.Item>
          <Form.Item label="使用期限" name="expiryDate">
            <DatePicker style={{ width: "50%" }} />
          </Form.Item>
          <Form.Item label="备注" name="description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
