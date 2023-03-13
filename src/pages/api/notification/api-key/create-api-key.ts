import client from "@/utils/prisma";
import { Response } from "@/types/Response";
import { SIBKey } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export type CreateAPIKeyRequestBody = {
  key: string;
  sibEmail: string;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const data: CreateAPIKeyRequestBody = req.body;

  if (!data) {
    res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
    return;
  }

  const keys = await client.sIBKey.createMany({
    data: data,
  });

  if (!keys) {
    res.status(500).json({
      success: false,
      message: "Failed to create API keys",
    });
    return;
  }

  res.status(200).json({ success: true });
}
