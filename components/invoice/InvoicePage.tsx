import { Button } from "antd";
import { useState } from "react";
import CreateInvoiceModal from "./CreateInvoiceModal";
import InvoiceTable from "./InvoiceTable";

const InvoicePage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(+new Date());
  return (
    <div className="p-4">
      <div className="flex flex-row justify-end mb-4">
        <Button type="primary" onClick={() => setShowCreate(true)}>
          创建账单
        </Button>
      </div>
      <InvoiceTable refreshKey={refreshKey} />
      <CreateInvoiceModal
        visible={showCreate}
        onCancel={() => {
          setShowCreate(false);
          setRefreshKey(+new Date());
        }}
      />
    </div>
  );
};

export default InvoicePage;
