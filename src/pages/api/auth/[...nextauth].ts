import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
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
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

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
