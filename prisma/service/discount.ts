import prisma from "../../db/client";
import _get from "lodash/get";
import student from "../../pages/api/student";

export async function getDiscountByCustomerId(customerId: number) {
  const now = new Date().toISOString();
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        discounts: {
          where: {
            expiryDate: {
              gt: now,
            },
            usageDate: {
              equals: null,
            },
          },
          select: {
            id: true,
            name: true,
            amount: true,
            description: true,
            expiryDate: true,
          },
        },
      },
    });
    return _get(customer, "discounts", []);
  } catch (e) {
    console.error(`get discount by user id: ${customerId} error: `, e);
    return [];
  }
}

export async function validate(data: {
  discountId: number;
  customerId?: number;
  studentId?: number;
}) {
  const now = +new Date();
  const { discountId, customerId, studentId } = data;
  try {
    const discount = await prisma.discount.findUnique({
      where: {
        id: discountId,
      },
    });
    if (!discount) {
      console.error("discount not exists");
      throw new Error("优惠券无效");
    }
    const expire = +new Date(discount.expiryDate);
    if (expire < now) {
      console.error(
        `discount has been expired - ${discountId} timestamp: ${expire} ${now}`
      );
      throw new Error("优惠券已过期");
    }

    if (discount.paymentId) {
      console.error(
        `discount has been used by payment - ${discount.paymentId}`
      );
      throw new Error("优惠券已使用");
    }
    if (studentId && discount.studentId != studentId) {
      console.log(
        `discount - ${discountId} not available for student - ${studentId}`
      );
      throw new Error("优惠券不可使用");
    }
    if (customerId && discount.customerId != customerId) {
      console.log(
        `discount - ${discountId} not available for customer - ${customerId}`
      );

      throw new Error("优惠券不可使用");
    }

    return discount;
  } catch (e: any) {
    console.error(`discount id - ${discountId} is invalid: `, e);
    throw e;
    // return null;
  }
}
