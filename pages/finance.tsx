import { Button, Tabs } from "antd";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateDiscountModal from "../components/discount/CreateDiscountModal";
import DiscountTable from "../components/discount/DiscountTable";
import CreateInvoiceTemplateModal from "../components/invoice/CreateInvoiceTemplateModal";
import InvoicePage from "../components/invoice/InvoicePage";
import InvoiceTemplateTable from "../components/invoice/InvoiceTemplateTable";
import getUserSession from "./api/auth/getUserSession";

export const getServerSideProps: GetServerSideProps = async function (context) {
  const session = await getUserSession(context.req);

  return {
    props: {
      invoices: [],
    },
  };
};

const TabPane = Tabs.TabPane;

const InvoiceTemplatePage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(+new Date());
  return (
    <div className="p-4">
      <div className="flex flex-row justify-end mb-4">
        <Button type="primary" onClick={() => setShowCreate(true)}>
          创建模版
        </Button>
      </div>

      <CreateInvoiceTemplateModal
        visible={showCreate}
        onCancel={() => {
          setShowCreate(false);
          setRefreshKey(+new Date());
        }}
      />
      <InvoiceTemplateTable refreshKey={refreshKey} />
    </div>
  );
};

const DiscountPage = () => {
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

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("invoice");

  useEffect(() => {
    if (router.query) {
      const tab = router.query.tab;
      if (tab) {
        setActiveTab(tab.toString());
      }
    }
  }, [router.query]);
  return (
    <div className="p-4">
      <Tabs
        activeKey={activeTab}
        onChange={(tab) => {
          router.push(`/finance?tab=${tab}`, undefined, {
            shallow: true,
          });
        }}
      >
        <TabPane tab="账单" key="invoice">
          <InvoicePage />
        </TabPane>
        <TabPane tab="支付模版" key="invoiceTemplate">
          <InvoiceTemplatePage />
        </TabPane>
        <TabPane tab="折扣" key="discount">
          <DiscountPage />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Page;
