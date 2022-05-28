import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Invoice } from "@prisma/client";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import React, { useState } from "react";
import SchoolSearch from "../common/SchoolSearch";

function createInvoiceTemplate(params: Invoice) {
  return fetch("/api/invoiceTemplate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export default function CreateInvoiceTemplateModal({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      title="创建支付模版"
      visible={visible}
      onCancel={onCancel}
      onOk={async () => {
        const formValue = form.getFieldsValue();
        const templateParams = {
          ...formValue,
          payments: formValue.payments.map((p) => ({
            amount: p.amount * 100,
            dueDate: p.dueDate.toISOString(),
          })),
        };
        console.log("create invoice template", templateParams);
        await createInvoiceTemplate(templateParams);
        onCancel();
      }}
    >
      <div>
        <Form layout="vertical" form={form}>
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="学校" name="schoolId">
            <SchoolSearch
              onChange={(school) => {
                if (school) {
                  form.setFieldsValue({ schoolId: school.id });
                }
              }}
            />
          </Form.Item>
          <Form.List name="payments">
            {(fields, { add, remove }, { errors }) => {
              return (
                <>
                  {fields.map((field, index) => {
                    console.log("render field", field);
                    return (
                      <Form.Item key={field.key}>
                        <div className="flex justify-between mb-2">
                          <span>第{index + 1}期</span>
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                          />
                        </div>
                        <Form.Item {...field} name={[field.name, "amount"]}>
                          <InputNumber style={{ width: "50%" }} />
                        </Form.Item>
                        <Form.Item
                          label="截止日期"
                          name={[field.name, "dueDate"]}
                        >
                          <DatePicker style={{ width: "50%" }} />
                        </Form.Item>
                      </Form.Item>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: "60%" }}
                      icon={<PlusOutlined />}
                    >
                      添加付款分期
                    </Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.List>

          <Form.Item label="备注" name="description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
