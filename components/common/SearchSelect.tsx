import { Student } from "@prisma/client";
import { Select } from "antd";
import { debounce } from "lodash";
import React, { ReactNode, useState } from "react";

export default function StudentSearch<T extends { id: number }>({
  onChange,
  onSearch,
  renderItem,
  placeholder,
}: {
  onChange: (item: T | undefined) => void;
  onSearch: (searchText: string) => Promise<T[]>;
  renderItem: (item: T) => ReactNode;
  placeholder: string | undefined;
}) {
  const [state, setState] = useState<{ data: T[]; value: any }>({
    data: [],
    value: undefined,
  });

  const debounceSearch = debounce(
    (search, resolve, reject) => onSearch(search).then(resolve).catch(reject),
    500
  );
  const options = state.data.map((d: T) => (
    <Select.Option key={d.id}>{renderItem(d)}</Select.Option>
  ));

  return (
    <Select
      showSearch
      value={state.value}
      placeholder={placeholder}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={(value) => {
        if (value) {
          debounceSearch(
            value,
            (result: T[]) => {
              console.log("search result ", result);
              setState({ ...state, data: result });
            },
            (err: any) => {
              console.log("search student error ", err);
            }
          );
        } else {
          setState({ ...state, data: [] });
        }
      }}
      onChange={(value) => {
        setState({ ...state, value });
        onChange(state.data.find((s) => s.id === Number(value)));
      }}
      notFoundContent={null}
    >
      {options}
    </Select>
  );
}
