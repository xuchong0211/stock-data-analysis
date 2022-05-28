import { School, Student } from "@prisma/client";
import { Select } from "antd";
import { debounce } from "lodash";
import React, { useState } from "react";
import SearchSelect from "./SearchSelect";

function searchSchool(searchText: string) {
  return fetch("/api/school?name=" + searchText, {
    method: "GET",
  }).then((res) => res.json());
}

export default function SchoolSearch({
  onChange,
}: {
  onChange: (school: School | undefined) => void;
}) {
  return (
    <SearchSelect
      placeholder="搜索学校名称"
      onSearch={(name) => searchSchool(name)}
      renderItem={(school: School) => <span>{school.name}</span>}
      onChange={onChange}
    />
  );
}
