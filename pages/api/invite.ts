import { Student, UserInvite } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import getUserSession from "./auth/getUserSession";
import prisma from "../../db/client";
import shortUUID from "short-uuid";

const USER_ROLE_TYPE = {
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserInvite | null>
) {
  const session = await getUserSession(req);

  if (req.method === "POST") {
    if (!session) {
      res.status(401);
      res.end();
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      include: { roles: true },
    });

    // const isAdmin = currentUser?.roles.find(
    //   (role) => role.role === USER_ROLE_TYPE.ADMIN
    // );

    if (!currentUser) {
      res.status(401);
      res.end();
      return;
    }

    const invite = await prisma.userInvite.create({
      data: {
        id: shortUUID.generate(),
        creator: { connect: { id: currentUser?.id } },
        expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 2),
        roles: req.body.roles.join(","),
      },
    });
    res.json(invite);
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
