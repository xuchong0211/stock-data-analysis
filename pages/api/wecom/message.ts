import { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "../auth/getUserSession";
import prisma from "../../../db/client";
import {
  sendMiniappMessage,
  sendMsgToExternalContact,
} from "../../../server/wecom";

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
    const { wecomUserId, invoiceId, title, toInternal } = params;

    const wecomUser = await prisma.wecomUser.findUnique({
      where: { id: wecomUserId },
    });

    if (!wecomUser) {
      res.status(200).json({ error: "未找到可发送信息的用户" });
      return;
    }

    console.log("send wecom message", params);
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          select: {
            user: {
              select: {
                wechatUser: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      res.status(200).json({ error: "该订单不存在" });
      return;
    }

    const unionid = invoice?.customer?.user?.wechatUser?.unionid;

    if (!unionid) {
      res.status(200).json({ error: "用户与客户未在企业微信中完成绑定" });
      return;
    }

    const externalContact = await prisma.externalContact.findUnique({
      where: {
        contactId: {
          unionid: unionid,
          subscriptionId: wecomUser.id,
        },
      },
    });

    if (!externalContact) {
      res.status(200).json({ error: "用户与客户未在企业微信中完成绑定" });
      return;
    }

    //todo fixme send message available for two ways
    ////////////////////////////////////////////////////////////
    let sendResult = {};
    if (toInternal) {
      sendResult = await sendMiniappMessage(
        session.user.id,
        wecomUser?.wecomUserid,
        title
      );
    } else {
      sendResult = await sendMsgToExternalContact(
        session.user.id,
        wecomUser?.wecomUserid,
        externalContact.externalId,
        title,
        [{ key: "invoiceId", value: params.invoiceId }]
      );
    }

    // console.log("send wecom message result: ", sendResult);
    if (sendResult.errcode) {
      sendResult.error = sendResult.errmsg;
    }
    res.status(200).json(sendResult);

    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
