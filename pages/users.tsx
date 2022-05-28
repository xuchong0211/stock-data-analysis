import { User, UserRole } from "@prisma/client";
import { GetServerSideProps } from "next";
import useSWR, { SWRConfig } from "swr";
import prisma from "../db/client";
import { ExternalContact } from "@prisma/client";
import superjson from "superjson";
import {
  Table,
} from "antd";
import React  from "react";
import { format } from "date-fns";
import getUserSession from "./api/auth/getUserSession";

export const getServerSideProps: GetServerSideProps = async function (context) {
  const session = await getUserSession(context.req);

  if (!session?.user) {
    return { props: { exams: [] } };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true, roles: true },
  });

  const users = !currentUser
    ? []
    : await prisma.user.findMany({
        where: { companyId: currentUser?.companyId },
        include: { roles: true },
      });

  return {
    props: {
      fallback: {
        "/api/users": superjson.serialize(users).json,
      },
    },
  };
};



function roleLabel(role: string) {
  return role.indexOf("ROLE_ADMIN") >= 0
    ? "系统管理员"
    : role.indexOf("ROLE_TEACHER") >= 0
    ? "老师"
    : role.indexOf("ROLE_FINANCE_ADMIN") >= 0
    ? "财务管理员"
    : role;
}


function UserTable({ users }: { users: User[] }) {
  const columns = [
    { title: "姓名", dataIndex: "name" },
    { title: "手机号", dataIndex: "phone" },
    {
      title: "权限",
      dataIndex: "roles",
      render(roles: UserRole[]) {
        return <div>{roles.map((role) => roleLabel(role.role)).join(",")}</div>;
      },
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      render(createdAt: string) {
        return <div>{format(new Date(createdAt), "yyyy-MM-dd HH:mm")}</div>;
      },
    },
  ];


  return users ? (
    <Table
      columns={columns}
      dataSource={users.filter(
        (u) => !u.roles.find((role) => role.role === "ROLE_CUSTOMER")
      )}
      pagination={
        users.length < 10 ? false : { pageSize: 20, total: users.length }
      }
      rowKey={(user: ExternalContact) => user.id}
    />
  ) : null;
}

function UserListPage() {
  const { data, error } = useSWR("/api/users");
  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="text-lg">员工列表</div>
      </div>
      <UserTable users={data} />

    </div>
  );
}
const Page = ({ fallback }: { fallback: { "/api/users": User[] } }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <UserListPage />
    </SWRConfig>
  );
};

export default Page;
