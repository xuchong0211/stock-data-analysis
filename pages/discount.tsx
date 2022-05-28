import { Button } from "antd";
import { GetServerSideProps } from "next";
import { useState } from "react";
import CreateDiscountModal from "../components/discount/CreateDiscountModal";
import DiscountTable from "../components/discount/DiscountTable";

import getUserSession from "./api/auth/getUserSession";

export const getServerSideProps: GetServerSideProps = async function (context) {
  const session = await getUserSession(context.req);

  if (!session?.user) {
    return { props: {} };
  }

  return {
    props: {},
  };
};

const Page = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(+new Date());

  return (
    <div className="p-4">
      <div className="flex flex-row justify-end mb-4">
        <Button type="primary" onClick={() => setShowCreate(true)}>
          创建折扣
        </Button>
      </div>
      <DiscountTable refreshKey={refreshKey} />
      <CreateDiscountModal
        visible={showCreate}
        onCancel={() => {
          setRefreshKey(+new Date());
          setShowCreate(false);
        }}
      />
    </div>
  );
};

export default Page;
