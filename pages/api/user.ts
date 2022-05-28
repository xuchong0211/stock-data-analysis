import { Prisma, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../db/client";

export type USER_ROLE =
  | "ROLE_ADMIN"
  | "ROLE_TEACHER"
  | "ROLE_FINANCE_ADMIN"
  | "ROLE_FINANCE_USER"
  | "ROLE_SALES"
  | "ROLE_USER";

export async function apiUser(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
}

async function getUserWithWecom() {
  return prisma.wecomUser.findMany({
    where: {},
    include: { user: true, externalContacts: true },
  });
}

export function hasRole(
  user: Prisma.UserGetPayload<{ include: { roles: true } }>,
  role: USER_ROLE
) {
  return user.roles?.find((r) => r.role === role);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const users = await getUserWithWecom();
    res.status(200).json(users);
    return;
  }

  if (req.method === "POST") {
    const params = {
      ...JSON.parse(req.body),
    };
    console.log("user params ", params);
    try {
      let companyId = params.companyId;
      let roles = ["ROLE_USER"];

      if (!companyId) {
        const company = await prisma.company.create({
          data: { name: params.name + "的公司" },
        });
        console.log("company created ", company);
        companyId = company.id;
        roles = ["ROLE_ADMIN"];
      }

      if (params.inviteId) {
        const invite = await prisma.userInvite.findUnique({
          where: { id: params.inviteId },
          include: { creator: true },
        });

        if (invite && !invite.signupAt) {
          console.log("using invite for registration ", invite);
          companyId = invite.creator.companyId;
          roles = invite.roles.split(",");
        } else {
          console.log("Invite has already been used", params.inviteId);
          res.status(400);
          return;
        }
      }

      const { phone, name } = params;
      const user = await prisma.user.create({
        data: {
          phone,
          name,
          company: { connect: { id: companyId } },
          roles: {
            createMany: { data: roles.map((r) => ({ role: r })) },
          },
        },
        include: { roles: true },
      });

      console.log("user created", user);

      if (user && params.inviteId) {
        const updateInviteResult = await prisma.userInvite.update({
          where: { id: params.inviteId },
          data: { signupAt: new Date() },
        });
        console.log("update invite result ", updateInviteResult);
      }

      res.status(200).json(user);
    } catch (err: any) {
      console.log("catched error", err);
      res.status(200).json({ error: err?.meta });
    }

    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
