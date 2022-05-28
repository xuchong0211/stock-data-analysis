import { Button } from "antd";
import { GetServerSideProps } from "next";
import { useState } from "react";
import CreateInvoiceModal from "../components/invoice/CreateInvoiceModal";
import InvoiceTable from "../components/invoice/InvoiceTable";

import getUserSession from "./api/auth/getUserSession";

export const getServerSideProps: GetServerSideProps = async function (context) {
  const session = await getUserSession(context.req);

  if (!session?.user) {
    return { props: { invoices: [] } };
  }

  return {
    props: {
      invoices: [],
    },
  };
};

const Page = () => {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="p-4">
      <div className="flex flex-row justify-end mb-4">
        <Button type="primary" onClick={() => setShowCreate(true)}>
          创建账单
        </Button>
      </div>
      <InvoiceTable />
      <CreateInvoiceModal
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
      />
    </div>
  );
};

export default Page;
