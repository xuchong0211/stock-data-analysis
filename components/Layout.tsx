import {
  AccountBookOutlined,
  FormOutlined,
  LogoutOutlined,
  SmileOutlined,
  SolutionOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Button, Menu, Tag } from "antd";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

function MenuIcon({
  selected,
  icon,
  label,
}: {
  selected: boolean;
  icon: (color: string) => React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-y-1">
      {icon(selected ? "dodgerblue" : "gray")}
      <span className={selected ? "text-blue-500" : "text-gray-600"}>
        {label}
      </span>
    </div>
  );
}

const IS_UAT = process.env.NEXT_PUBLIC_ENV === "uat";

const Layout: React.FC = function ({ children }) {
  const router = useRouter();
  const { data } = useSession();

  return (
    <div className="flex h-screen w-screen flex-col ">
      <header className="w-full py-3 px-8 flex justify-between items-center shadow-sm bg-white fixed z-50">
        <span className="flex flex-row items-center gap-x-4">
          {IS_UAT ? <Tag color="red">测试服务器</Tag> : ""}
        </span>

        <div onClick={() => signOut()}>
          <span className="mr-2 text-regal-blue">{data?.user?.name}</span>
          <Button shape="circle" icon={<LogoutOutlined />} />
        </div>
        {}
      </header>
      <main className="flex flex-1" style={{ marginTop: 56 }}>
        <div
          style={{ width: 60 }}
          className="flex flex-col shadow-lg py-6 px-2 gap-y-8 fixed h-full"
        >

          <Link href="/users" passHref>
            <a>
              <MenuIcon
                label="员工"
                icon={(color) => (
                  <TeamOutlined style={{ fontSize: 22, color }} />
                )}
                selected={router.pathname.indexOf("/users") >= 0}
              />
            </a>
          </Link>
          <Link href="/stocks" passHref>
            <a>
              <MenuIcon
                label="股票"
                icon={(color) => (
                  <AccountBookOutlined style={{ fontSize: 22, color }} />
                )}
                selected={router.pathname.indexOf("/stocks") >= 0}
              />
            </a>
          </Link>
        </div>
        <div className="flex-1" style={{ marginLeft: 60 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
