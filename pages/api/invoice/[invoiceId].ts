import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../db/client";
import { getDiscountByCustomerId } from "../../../prisma/service/discount";
import { handlerWithLogin } from "../../../utils/requestHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  currentUser: any
) {
  console.log(" invoice details 0------------------------", req.query);
  const { invoiceId } = req.query;

  console.log("current user ..................", currentUser);

  if (req.method === "GET") {
    const result = await prisma.invoice.findUnique({
      where: { id: Number(invoiceId) },
      include: {
        student: {
          select: {
            id: true,
            customer: { select: { id: true, name: true } },
            name: true,
            examStudentId: true,
            clazz: {
              select: {
                name: true,
                area: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            discount: {
              select: {
                name: true,
                amount: true,
              },
            },
            wechatPayment: {
              select: {
                id: true,
                timeEnd: true,
                totalFee: true,
                transactionId: true,
                refundFee: true,
              },
            },
          },
        },
      },
    });
    console.log("get invoices ", result);

    let discounts: any[] = [];

    if (!(result?.payments && result?.payments.length > 0)) {
      discounts = await getDiscountByCustomerId(result?.customerId);
    }

    res.status(200).json({ ...result, discounts });
    return;
  }

  // if (req.method === "POST") {
  //   const params = req.body;
  //   const result = await prisma.invoice.create({
  //     data: { ...params, creator: { connect: { id: currentUser?.id } } },
  //   });
  //   console.log("create invoice ", result);
  //   res.status(200).json(result);
  //   return;
  // }

  // if (req.method === "DELETE") {
  // }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}

export default handlerWithLogin(handler);
