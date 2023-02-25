// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../utils/prisma";
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
    const { name, email, password } = req.body;

    if (!email || !email.includes("@") || !password || password.trim().length < 8) {
      res.status(422).json({ success: false, message: "Invalid input" });
      return;
    }

    // Check if user already exists
    const existingUser = await PrismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      res.status(422).json({ success: false, message: "User already exists" });
      return;
    }

    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    let response = await PrismaClient.user.create({
      data: {
        name: name,
        email: email,
        emailVerified: new Date(),
        image: null,
        password: hashedPassword,
      },
    });

    if (response.name) {
    }
  } else {
    res.status(405).end();
  }
}
