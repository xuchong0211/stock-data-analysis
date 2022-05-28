import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../db/client";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "用户名", type: "text", placeholder: "手机号" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        console.log("try to authorize user ", credentials);

        const user = await prisma.user.findUnique({
          where: { phone: credentials?.username },
        });
        console.log("user trying to login: ", user);
        if (user && credentials?.password === "1234") {
          console.log("login success!", user);
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      console.log("user signed in ", user, account, profile, credentials);
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        const userId: number = Number(token.sub);
        session.user.id = userId;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (isNewUser) {
        return token;
      }

      const userExist = await prisma.user.count({
        where: { id: Number(token.sub) },
      });

      if (userExist > 0) {
        return token;
      }

      throw new Error("Invalid user");
    },
  },
  pages: {
    signIn: "/auth/passwordSignIn",
    // signOut: "/auth/signout",
    // error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
});
