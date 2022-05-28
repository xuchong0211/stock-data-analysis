import { Customer } from "@prisma/client";
import React from "react";
import SearchSelect from "./SearchSelect";

function searchCustomer(searchText: string) {
  return fetch("/api/customer?name=" + searchText, {
    method: "GET",
  }).then((res) => res.json());
}

export default function CustomerSearch({
  onChange,
}: {
  onChange: (customer: Customer | undefined) => void;
}) {
  return (
    <SearchSelect
      placeholder="客户姓名"
      onSearch={(name) => searchCustomer(name)}
      renderItem={(customer: Customer) => <span>{customer.name}</span>}
      onChange={onChange}
    />
  );
}
