import { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "../auth/getUserSession";
import prisma from "../../../db/client";
import { getWecomUserFromPhone } from "../../../server/wecom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getUserSession(req);

  if (!session) {
    res.status(401);
    return;
  }

  if (req.method === "POST") {
    const params = req.body;
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { wecomUser: true },
    });

    console.log("current user", user);

    if (user?.wecomUser) {
      return res.status(200).json({ error: "已有微信用户绑定请先解绑" });
    }

    if (user) {
      const wecomUser = await getWecomUserFromPhone(user.id, user.phone);

      if (wecomUser?.userid) {
        const bindUserResult = await prisma.wecomUser.create({
          data: {
            user: { connect: { id: params.userId } },
            wecomUserid: wecomUser.userid,
          },
        });
        console.log("bind wecom user result ", bindUserResult);
        res.status(200).json(bindUserResult);
        return;
      }
    }

    res.status(200).json({ error: "无法获取企业微信用户" });
    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
