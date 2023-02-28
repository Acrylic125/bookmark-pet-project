// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import { SellPost } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const SellPostGetBody = z.object({});
const CreateSellPostBody = z.object({
  name: z.string().min(8).max(128),
  description: z.string().min(0).max(1024),
  status: z.enum(["available", "sold_out"]),
});

async function POST(req: NextApiRequest, res: NextApiResponse<SellPost>) {
  const body = CreateSellPostBody.parse(req.body);

  try {
    const created = await client.sellPost.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
      },
    });
    res.status(200).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

async function GET(req: NextApiRequest, res: NextApiResponse<SellPost[]>) {
  const body = SellPostGetBody.parse(req.body);

  try {
    const sellPosts = await client.sellPost.findMany();
    res.status(200).json(sellPosts);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return await POST(req, res);
    case "GET":
      return await GET(req, res);
    default:
      res.status(405).end();
  }
}
