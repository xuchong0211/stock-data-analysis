import OSS from "ali-oss";
import { STSToken } from "../model/types";

export async function ossUpload(stsToken: STSToken, path: string, file: File) {
  if (!path || !file) {
    return;
  }

  const client = new OSS({
    region: "oss-cn-hangzhou",
    accessKeyId: stsToken.AccessKeyId,
    accessKeySecret: stsToken.AccessKeySecret,
    stsToken: stsToken.SecurityToken,
    bucket: "breezecapsule",
  });

  console.log("try to upload ", file, path);
  const ossResult = await client.put(path, file);
  console.log("oss result", ossResult);
  return ossResult;
}
