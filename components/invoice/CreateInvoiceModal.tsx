import { Invoice, Prisma } from "@prisma/client";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import format from "date-fns/format";
import { sumBy } from "lodash";
import React, { useState } from "react";
import CustomerSearch from "../common/CustomerSearch";

function createInvoice(params: Invoice) {
  return fetch("/api/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export default function CreateInvoiceModal({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();
  const [schoolId, setSchoolId] = useState(undefined);
  const [template, setInvoiceTemplate] = useState<
    | Prisma.InvoiceTemplateGetPayload<{ include: { payments: true } }>
    | undefined
  >(undefined);

  return (
    <Modal
      title="创建账单"
      visible={visible}
      onCancel={onCancel}
      onOk={async () => {
        const formValue = form.getFieldsValue();
        const invoiceValue = {
          ...formValue,
          dueDate: formValue.dueDate?.toISOString(),
        };
        console.log("create invoice", invoiceValue);
        await createInvoice(invoiceValue);
        onCancel();
      }}
    >
      <div>
        <Form layout="vertical" form={form}>
          <Form.Item label="客户" name="customerId">
            <CustomerSearch
              onChange={(customer) => {
                if (customer) {
                  form.setFieldsValue({ customerId: customer.id });
                }
              }}
            />
          </Form.Item>
          {template ? null : (
            <>
              <Form.Item label="金额" name="amount">
                <InputNumber style={{ width: "50%" }} />
              </Form.Item>
              <Form.Item label="截止日期" name="dueDate">
                <DatePicker style={{ width: "50%" }} />
              </Form.Item>
              <Form.Item label="名称" name="title">
                <Input />
              </Form.Item>
              <Form.Item label="备注" name="description">
                <Input.TextArea />
              </Form.Item>
            </>
          )}
        </Form>
        {template ? (
          <div>
            {template?.payments.map((payment, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold">第{i + 1}期</div>
                <div className="flex justify-between">
                  <div>
                    付款期限: {format(new Date(payment.dueDate), "yyyy-MM-dd")}
                  </div>
                  <div> 金额: ¥{(payment.amount / 100).toFixed(2)}</div>
                </div>
              </div>
            ))}
            <div className="font-bold mt-4 pt-2 border-t border-gray-400 flex flex-row-reverse">
              总金额: ¥
              {(sumBy(template.payments, (p) => p.amount) / 100).toFixed(2)}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
