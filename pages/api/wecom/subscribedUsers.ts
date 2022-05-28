import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const session = await getUserSession(req);
  //
  // if (!session) {
  //   res.status(401);
  //   return;
  // }

  if (req.method === "POST") {
    const params = req.body;
    const { customerId } = params;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        user: {
          select: {
            wechatUser: true,
          },
        },
      },
    });

    if (customer) {
      const unionid = customer?.user?.wechatUser?.unionid;

      // console.log("unionid ,,,,,,,,,,,,,,,,,,,,,,,,,,,,", unionid);

      const wecomUser = await prisma.externalContact.findMany({
        where: {
          unionid,
        },
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(wecomUser.map(({ subscription }) => subscription));
      return;
    }

    // const user

    res.status(200).json({ error: "无法获取用户信息" });
    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
