import { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "../auth/getUserSession";
import prisma from "../../../db/client";
import {
  getWecomUserExternalContactDetails,
  getWecomUserExternalContacts,
} from "../../../server/wecom";
import { z } from "zod";

const EXTERNAL_CONTACT_SCHEMA = z.object({
  external_userid: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  unionid: z.string(),
  type: z.number().int().nullable(),
  gender: z.number().int().nullable(),
});

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
    try {
      const params = req.body;
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        include: { wecomUser: true },
      });

      // console.log("current user", user);
      // console.log("current user 2222222222222222222", !user?.wecomUser);

      if (!user?.wecomUser) {
        return res.status(200).json({ error: "微信用户未绑定，请先解绑" });
      }

      const wecomUser = user?.wecomUser;

      // console.log("222222222222222222", wecomUser);

      const externalUsers = await getWecomUserExternalContacts(
        user.id,
        wecomUser.wecomUserid
      );

      // external_userid: 'wme5GOCgAAKKOMKtmGzpo2sbZhgcoMHg',
      //     name: '正义的伙伴',
      //     type: 1,
      //     avatar: 'http://wx.qlogo.cn/mmhead/Q3auHgzwzM4MmKkdwrAZpKUBS7WnOUaHIJuLk4nYBibu0XjOA3u9xYw/0',
      //     gender: 1,
      //     unionid: 'oIU4-uGII0XRRqgeO8FGLcyTP7is'

      const updateList: string[] = [];

      for (let i = 0; i < externalUsers.length; i++) {
        console.log("111111111111111111111", externalUsers[i]);
        const details = await getWecomUserExternalContactDetails(
          user.id,
          externalUsers[i]
        );

        try {
          const externalContactData = EXTERNAL_CONTACT_SCHEMA.parse(details);
          console.log("external contact from wecom:", externalContactData);
          const {
            external_userid,
            name,
            avatar,
            gender,
            type,
            unionid,
          } = externalContactData;
          const externalContact = await prisma.externalContact.upsert({
            where: {
              contactId: {
                unionid: unionid,
                // externalId: external_userid,
                subscriptionId: wecomUser.id,
              },
            },
            update: {
              name: name,
              avatar: avatar,
              gender: gender,
              type: type,
            },
            create: {
              unionid: unionid,
              externalId: external_userid,
              name,
              avatar: avatar,
              gender: gender,
              type: type,
              subscription: { connect: { id: wecomUser.id } },
            },
          });
          updateList.push(externalContact.name);
        } catch (e) {
          console.error("get external contact error", e, details);
        }
      }

      res.status(200).json({ data: updateList });
      return;
      // }
    } catch (e: any) {
      res.status(200).json({ error: e.message });
      return;
    }

    res.status(200).json({ error: "无法获取企业微信用户联系人" });
    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
