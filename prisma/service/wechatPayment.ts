import prisma from "../../db/client";
import { z } from "zod";

const REFUND_SCHEMA = z.object({
  body: z.string(),
  openId: z.string(),
  invoiceId: z.number(),
  appid: z.string(),
  mchId: z.string(),
  sign: z.string(),
  transactionId: z.string(),
  nonceStr: z.string(),
  outTradeNo: z.string(),
  outRefundNo: z.string(),
  refundId: z.string(),
  refundFee: z.number(),
  totalFee: z.number(),
});

export async function saveRefund(
  refund: any,
  paymentId: number,
  userId: number
) {
  const data = REFUND_SCHEMA.parse(refund);
  console.log("validate refund data", data);
  // const now = new Date().toISOString();
  const {
    body,
    openId,
    invoiceId,
    appid,
    mchId,
    sign,
    transactionId,
    nonceStr,
    outTradeNo,
    outRefundNo,
    refundId,
    refundFee,
    totalFee,
  } = data;
  try {
    const refund = await prisma.wechatPayment.create({
      data: {
        body,
        openId,
        invoiceId,
        appid,
        mchId,
        sign,
        transactionId,
        nonceStr,
        outTradeNo: outTradeNo + "_" + +new Date(),
        outRefundNo,
        refundId,
        refundFee: (refundFee / 100).toFixed(2).toString(),
        totalFee: (totalFee / 100).toFixed(2).toString(),

        payment: { connect: { id: paymentId } },
        payer: { connect: { id: userId } },
      },
    });
    return refund;
  } catch (e) {
    console.error(`save refund error: `, e);
    throw Error("保存微信退款信息失败");
  }
}
