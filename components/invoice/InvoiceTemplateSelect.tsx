import { InvoiceTemplate, Prisma } from "@prisma/client";
import { Select } from "antd";
import useSWR from "swr";

function getInvoiceTemplates(schoolId: number) {
  return fetch("/api/invoiceTemplate?schoolId=" + schoolId, {
    method: "GET",
  }).then((res) => res.json());
}

export default function InvoiceTemplateSelect({
  schoolId,
  onChange,
}: {
  schoolId?: number;
  onChange: (
    template: Prisma.InvoiceTemplateGetPayload<{ include: { payments: true } }>
  ) => void;
}) {
  const { data } = useSWR<InvoiceTemplate[]>("/api/invoiceTemplate", () => {
    console.log("get invoice template by school id", schoolId);
    return schoolId ? getInvoiceTemplates(schoolId) : [];
  });

  return (
    <Select
      disabled={!schoolId}
      onChange={(id) => {
        const template = data?.find((t) => t.id === id);
        if (template) {
          onChange(template);
        }
      }}
      allowClear
      onClear={() => onChange(null)}
    >
      {data?.map((template: InvoiceTemplate) => (
        <Select.Option key={template.id} value={template.id}>
          {template.name}
        </Select.Option>
      ))}
    </Select>
  );
}
