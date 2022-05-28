import { EllipsisOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { WecomUser, Invoice } from "@prisma/client";
import {
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Select,
  Table,
  Space,
  Checkbox,
} from "antd";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

const { confirm } = Modal;

function getSubscribedUser(customerId: number | null) {
  const path = "/api/wecom/subscribedUsers";
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
  }).then((res) => res.json());
}

function getInvoices() {
  return fetch("/api/invoice", {
    method: "GET",
  }).then((res) => res.json());
}

function toRefund(paymentId: string) {
  return fetch("/api/miniapp/pay/refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  })
    .then((res) => res.json())
    .catch((e) => {
      console.log("退款失败", e);
      return { error: e.message };
    });
}

function sendWecomMessage(userId, title, invoiceId, toInternal: boolean) {
  return fetch("/api/wecom/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wecomUserId: userId, title, invoiceId, toInternal }),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log("send wecom message result ...............", result);
      if (result.error) {
        Modal.error({
          title: "发送信息失败",
          content: result.error,
          okText: "关闭",
        });
      } else {
        Modal.success({
          title: "发送信息成功",
          okText: "关闭",
        });
      }
    });
}

function UserSelect({
  onChange,
  customerId,
}: {
  onChange: (id: number) => void;
  customerId: number | null;
}) {
  // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", customerId);
  const { data } = useSWR(
    "/api/wecom/subscribedUsers?customerId=" + customerId,
    () => {
      return getSubscribedUser(customerId);
    }
  );
  return (
    <Select onChange={(id) => onChange(id)}>
      {(data || []).map((wecomUser: WecomUser) => (
        <Select.Option key={wecomUser.id} value={wecomUser.id}>
          {wecomUser?.user?.name}
        </Select.Option>
      ))}
    </Select>
  );
}

function SendInvoiceModal({
  visible,
  invoiceId,
  customerId,
  onCancel,
}: {
  visible: boolean;
  invoiceId?: number | null;
  customerId?: number | null;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();
  return (
    <Modal
      title="发送账单"
      visible={visible}
      onCancel={onCancel}
      onOk={async () => {
        const formValue = form.getFieldsValue();
        console.log("sendInvoice value", formValue);
        const result = await sendWecomMessage(
          formValue.userId,
          formValue.description,
          invoiceId,
          formValue.toInternal
        );
        console.log("send result", result);
        onCancel();
      }}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="toInternal" valuePropName="checked">
          <Checkbox>发送账单给同事，由同事手动转发至客户</Checkbox>
        </Form.Item>
        <Form.Item label="同事" name="userId">
          <UserSelect
            onChange={(id: number) => form.setFieldsValue({ userId: id })}
            customerId={customerId}
          />
        </Form.Item>

        <Form.Item label="备注" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function InvoiceTable(props: { refreshKey: number }) {
  const [sendParams, setSendParams] = useState<{
    invoiceId: number;
    customerId: number;
  } | null>(null);
  const { data, mutate } = useSWR("/api/invoice", () => getInvoices());

  useEffect(() => mutate(), [props.refreshKey]);

  const refund = async (paymentId: string) => {
    const result = await toRefund(paymentId);
    console.log("result", result);
    if (result.error) {
      Modal.error({
        title: "退款失败",
        content: result.error,
        okText: "关闭",
      });
    } else {
      Modal.success({
        title: "退款成功",
        okText: "关闭",
      });
    }
  };

  const expandedRowRender = (item: { payments: [] }) => {
    const { payments } = item;
    const columns = [
      {
        title: "支付日期",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (isoString: string) =>
          format(new Date(isoString), "yyyy-MM-dd HH:mm"),
      },
      {
        title: "金额",
        dataIndex: "amount",
        key: "amount",
        render: (value: number) => {
          return `￥ ${(value / 100).toFixed(2)}`;
        },
      },
      {
        title: "支付方式",
        dataIndex: "method",
        key: "method",
        render: (value) => {
          return value === "wechatmini"
            ? "微信支付"
            : value === "wechat_refund"
            ? "微信退款"
            : value;
        },
      },
      {
        title: "",
        dataIndex: "action",
        key: "action",
        render: (_, payment: any) =>
          payment.amount > 0 ? (
            <Space size="middle">
              <a
                onClick={() => {
                  confirm({
                    title: `退款`,
                    icon: <ExclamationCircleOutlined />,
                    content: `确认退款金额，￥${payment.wechatPayment.totalFee}`,
                    okText: "确定",
                    cancelText: "取消",
                    onOk() {
                      console.log("start to refund payment", payment);
                      refund(payment.id);
                    },
                    onCancel() {
                      console.log("Cancel");
                    },
                  });
                }}
              >
                退款
              </a>
            </Space>
          ) : (
            <span />
          ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={payments}
        pagination={false}
        rowClassName={() => {
          return "payments";
        }}
      />
    );
  };

  const columns = [
    {
      title: "创建日期",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (isoString: string) => (
        <span>{format(new Date(isoString), "yyyy-MM-dd HH:mm")}</span>
      ),
    },
    { title: "学生", dataIndex: ["student", "name"] },
    { title: "客户", dataIndex: ["customer", "name"] },
    {
      title: "金额",
      dataIndex: "amount",
      render(amount: number) {
        return <span>￥{amount.toFixed(2)}</span>;
      },
    },
    {
      title: "到期日期",
      key: "dueDate",
      dataIndex: "dueDate",
      render: (isoString: string) => (
        <span>{format(new Date(isoString), "yyyy-MM-dd")}</span>
      ),
    },
    { title: "创建人", key: "creator", dataIndex: ["creator", "name"] },
    { title: "名称", key: "title", dataIndex: "title" },
    { title: "备注", key: "description", dataIndex: "description" },
    {
      title: "其他",
      key: "other",
      dataIndex: "other",
      render: (_, invoice: Invoice) => {
        // console.log("invoice................", invoice);
        const menu = (
          <Menu>
            <Menu.Item
              key={"sendInvoice"}
              onClick={() => {
                if (!invoice.customerId) {
                  Modal.warning({
                    title: "账单没有绑定客户",
                  });
                  return;
                }
                const params = {
                  invoiceId: invoice.id,
                  customerId: invoice.customerId,
                };
                setSendParams(params);
                // setSendInvoiceId(invoice.id);
                // setSendCustomerId(invoice.customerId);
              }}
            >
              发送订单
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu}>
            <EllipsisOutlined style={{ fontSize: 20 }} />
          </Dropdown>
        );
      },
    },
  ];
  return (
    <div>
      <Table
        dataSource={data || []}
        columns={columns}
        expandable={{
          expandedRowRender,
          rowExpandable: (item) => {
            return item.payments && item.payments.length > 0;
          },
          fixed: "right",
          columnWidth: 25,
          indentSize: 1,
        }}
        rowKey={(record: Invoice) => record.id}
      />
      <SendInvoiceModal
        {...sendParams}
        visible={sendParams}
        onCancel={() => setSendParams(null)}
      />
    </div>
  );
}
