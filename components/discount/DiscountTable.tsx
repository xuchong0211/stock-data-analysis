import { EllipsisOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Customer, Student } from "@prisma/client";
import { Button, Dropdown, Menu, Popover, Table } from "antd";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

function getDiscounts() {
  return fetch("/api/discount", {
    method: "GET",
  }).then((res) => res.json());
}

export default function DiscountTable(props: { refreshKey: number }) {
  const { data, mutate } = useSWR("/api/discount", () => getDiscounts());

  useEffect(() => mutate(), [props.refreshKey]);
  const columns = [
    {
      title: "创建日期",
      dataIndex: "createdAt",
      render: (isoString: string) => (
        <span>{format(new Date(isoString), "yyyy-MM-dd HH:mm")}</span>
      ),
    },
    { title: "金额", dataIndex: "amount" },
    {
      title: "客户",
      dataIndex: ["customer"],
      render(customer: Customer) {
        return customer ? (
          <span className="flex gap-x-2 items-center">
            <span>{customer?.name}</span>
          </span>
        ) : (
          <span />
        );
      },
    },
    {
      title: "到期日期",
      dataIndex: "expiryDate",
      render: (isoString: string) => (
        <span>{format(new Date(isoString), "yyyy-MM-dd")}</span>
      ),
    },
    { title: "创建人", dataIndex: ["creator", "name"] },
    { title: "备注", dataIndex: "description" },
    {
      title: "其他",
      dataIndex: "other",
      render: () => {
        const menu = (
          <Menu>
            <Menu.Item onClick={() => {}}>停用</Menu.Item>
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
      <Table dataSource={data || []} columns={columns} />
    </div>
  );
}
