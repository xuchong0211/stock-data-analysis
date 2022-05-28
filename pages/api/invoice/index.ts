import type { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "../auth/getUserSession";
import prisma from "../../../db/client";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getUserSession(req);

  if (!session) {
    res.status(401);
    res.end();
    return;
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
  });

  if (!currentUser) {
    res.status(401);
    res.end();
    return;
  }

  if (req.method === "GET") {
    let query: Prisma.InvoiceFindManyArgs = {
      orderBy: { createdAt: "desc" },
      include: {
        creator: true,
        student: {
          select: {
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
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          include: {
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
    };

    if (req.query.customerId) {
      query.where = { customerId: Number(req.query.customerId) };
      query.orderBy = { dueDate: "asc" };
    }

    const result = await prisma.invoice.findMany(query);
    console.log("get invoices ", result, +new Date(), result.length);
    res.status(200).json(result);
    return;
  }

  if (req.method === "POST") {
    const params = req.body;

    if (params.templateId) {
      const template = await prisma.invoiceTemplate.findUnique({
        where: { id: params.templateId },
        include: { payments: true },
      });
      if (!template) {
        res.status(200).json({ error: "invalid invoice template" });
        return;
      }

      let student = params.studentId
        ? { connect: { id: params.studentId } }
        : undefined;
      let customer = params.customerId
        ? { connect: { id: params.customerId } }
        : undefined;

      const invoices = template.payments.map((p, i) => {
        const data = {
          amount: p.amount / 100,
          dueDate: p.dueDate,
          creator: { connect: { id: currentUser?.id } },
          student,
          customer,
          description: `${template.name}付款模版 - 第${i + 1}期`,
        };

        return prisma.invoice.create({
          data,
        });
      });

      const result = await prisma.$transaction(invoices);
      console.log("create invoices ", result);
      res.status(200).json(result);
    } else {
      const data = {
        ...params,
        creator: { connect: { id: currentUser?.id } },
        studentId: undefined,
        customerId: undefined,
      };

      if (params.studentId) {
        data.student = { connect: { id: params.studentId } };
      }

      if (params.customerId) {
        data.customer = { connect: { id: params.customerId } };
      }

      const result = await prisma.invoice.create({
        data,
      });
      console.log("create invoice ", result);
      res.status(200).json(result);
      return;
    }
  }

  if (req.method === "DELETE") {
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
