import { Button, Tabs } from "antd";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InvoicePage from "../components/invoice/InvoicePage";
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
        <TabPane tab="stocks" key="invoice">
          <InvoicePage />
        </TabPane>
        <TabPane tab="tab1" key="tab1">
            <div>tab1</div>
        </TabPane>
        <TabPane tab="tab2" key="tab2">
          <div>tabs</div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Page;
