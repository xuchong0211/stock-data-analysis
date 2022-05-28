declare module "@alicloud/sts-sdk";

import type { DefaultUser } from "next-auth";

interface UserWithId extends DefaultUser {
  id: number;
}
declare module "next-auth" {
  interface Session {
    user?: UserWithId;
  }
}
