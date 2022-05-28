import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decode, encode } from "next-auth/jwt";
import prisma from "../../db/client";

export async function createJWT(user: User) {
  const secret = process.env.NEXTAUTH_SECRET;
  const jwt = await encode({ secret, token: { sub: user.id.toString() } });
  return jwt;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    console.log("user trying to login: ", username);

    const user = await prisma.user.findUnique({
      where: { phone: username },
    });

    let token = {};
    if (user && password === "1234") {
      console.log("login success!", user);
      const secret = process.env.NEXTAUTH_SECRET;
      const jwt = await createJWT(user);
      //console.log("JWT token generated ", jwt);
      //   const decodedToken = await decode({ token: jwt, secret });
      //   console.log("decoded token", decodedToken);
      token = { jwt, user };
    }

    res.status(200).json(token);
    return;
  }

  console.log("Invalid method", req.method);
  res.status(405);
  return;
}
