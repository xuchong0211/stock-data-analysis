import { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "../pages/api/auth/getUserSession";
import prisma from "../db/client";
import { z } from "zod";

const SESSION_SCHEMA = z.object({
  user: z.object({
    id: z.number(),
  }),
});

async function getCurrentUser(req: NextApiRequest) {
  const result = await getUserSession(req);
  const session = SESSION_SCHEMA.parse(result);
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wechatUser: true },
  });
  return user;
}

type handlerType = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) => any;

export function checkUserSession(handler: handlerType) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    let user = null;
    try {
      user = await getCurrentUser(req);
    } catch (e) {
      res.status(200).json({ error: "用户未登录" });
      return;
    }
    return await handler(req, res, user);
  };
}

export function handlerWithLogin(handler: handlerType) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    let user = null;
    try {
      user = await getCurrentUser(req);
    } catch (e) {
      res.status(401).json({ error: "用户未登录" });
      res.end();
      return;
    }
    return await handler(req, res, user);
  };
}
