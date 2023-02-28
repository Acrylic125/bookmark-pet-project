import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // Verify that the user exists in the database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (user && user.password) {
          // Check  if the password is correct
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          // Any object returned will be saved in the `user` property of the JWT
          return isPasswordCorrect ? user : null;
        } else {
          // If you return null, an error will be displayed advising the user to check their details.
          return null;
        }
      },
    },
  ],
};

export default NextAuth(authOptions);
