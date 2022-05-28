import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { getSessionFromCookie } from "./getSessionFromCookie";

const secret = process.env.NEXTAUTH_SECRET;

if (!secret) {
  throw new Error("Please setup env var NEXTAUTH_SECRET");
}

export default async function getUserSession(req: NextApiRequest) {
  const session = await getSessionFromCookie(req);

  if (!session) {
    const token = await getToken({
      req,
      secret,
    });

    if (token && token.sub) {
      return {
        user: { id: Number(token.sub) },
        expires: new Date(Number(token.exp) * 1000).toISOString(),
      };
    }
  } else {
    return session;
  }
}
