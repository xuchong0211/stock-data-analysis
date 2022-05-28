import { Invoice, InvoiceTemplate, PaymentTemplate } from "@prisma/client";
import { Table } from "antd";
import { format } from "date-fns";
import { sumBy } from "lodash";
import React, { useEffect } from "react";
import useSWR from "swr";
import InvoiceTable from "./InvoiceTable";

function getInvoiceTemplates() {
  return fetch("/api/invoiceTemplate", {
    method: "GET",
  }).then((res) => res.json());
}

export default function InvoiceTemplateTable(props: { refreshKey: number }) {
  const { data, mutate } = useSWR("/api/invoiceTemplate", () =>
    getInvoiceTemplates()
  );

  useEffect(() => mutate(), [props.refreshKey]);

  const expandedRowRender = (item: { payments: [] }) => {
    const { payments } = item;
    const columns = [
      {
        title: "支付日期",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (isoString: string) =>
          format(new Date(isoString), "yyyy-MM-dd"),
      },
      {
        title: "金额",
        dataIndex: "amount",
        key: "amount",
        render: (value: number) => {
          return `￥ ${(value / 100).toFixed(2)}`;
        },
      },
    ];

    return <Table columns={columns} dataSource={payments} pagination={false} />;
  };

  const columns = [
    { title: "学校", dataIndex: ["school", "name"] },
    { title: "名称", dataIndex: ["name"] },

    {
      title: "金额",
      dataIndex: "payments",
      render(payments: PaymentTemplate[]) {
        const total = sumBy(payments, (p) => p.amount);
        return <span>￥{(total / 100).toFixed(2)}</span>;
      },
    },
    { title: "创建人", dataIndex: ["creator", "name"] },
    {
      title: "创建日期",
      dataIndex: "createdAt",
      render: (isoString: string) => (
        <span>{format(new Date(isoString), "yyyy-MM-dd")}</span>
      ),
    },
    { title: "备注", dataIndex: "description" },
    // {
    //   title: "其他",
    //   dataIndex: "other",
    //   render: (_, invoice) => {
    //     console.log("invoice................", invoice);
    //     const menu = (
    //       <Menu>
    //         <Menu.Item
    //           onClick={() => {
    //             console.log("send invoice");
    //             setSendInvoiceId(invoice.id);
    //           }}
    //         >
    //           发送订单
    //         </Menu.Item>
    //       </Menu>
    //     );

    //     return (
    //       <Dropdown overlay={menu}>
    //         <EllipsisOutlined style={{ fontSize: 20 }} />
    //       </Dropdown>
    //     );
    //   },
    // },
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
        rowKey={(record: InvoiceTemplate) => record.id}
      />
    </div>
  );
}
