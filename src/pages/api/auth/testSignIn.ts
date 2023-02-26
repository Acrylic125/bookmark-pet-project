import type { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "@prisma/client";
import bcrypt from "bcryptjs";

type Response = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method === "POST") {
    const prisma = new PrismaClient.PrismaClient();

    const user = await prisma.user.findUnique({
      where: {
        email: "karandeepsingh00@icloud.com",
      },
    });

    if (user && user.password) {
      // Check  if the password is correct
      const isPasswordCorrect = await bcrypt.compare(
        "testtesttest",
        user.password
      );

      if (isPasswordCorrect) {
        res.status(200).json({ success: true, message: "Logged in" });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } else {
    res.status(405).end();
  }
}
