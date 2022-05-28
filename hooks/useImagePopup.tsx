import { Modal } from "antd";
import { ReactNode, useState } from "react";

export default function useImagePopup(
  url: string | null
): [ReactNode, (url: string | null) => void] {
  const [imageUrl, setImageUrl] = useState<string | null>(url);
  const popup = (
    <Modal
      title="查看答题卡"
      visible={imageUrl !== null}
      footer={null}
      onCancel={() => setImageUrl(null)}
      modalRender={() => {
        return (
          <img
            style={{ width: "100%", marginLeft: "5%", marginRight: "5%" }}
            src={imageUrl}
          />
        );
      }}
    />
  );
  return [
    popup,
    (url) => {
      setImageUrl(url);
    },
  ];
}
