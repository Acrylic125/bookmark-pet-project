// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import { SellPost, SellPostUserBookmark } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const UpdateSellPostBookmarkBody = z.object({
  bookmark: z.boolean(),
});

async function POST(sellPostId: string, userId: string, req: NextApiRequest, res: NextApiResponse<SellPost>) {
  const body = UpdateSellPostBookmarkBody.parse(req.body);

  try {
    if (!body.bookmark) {
      await client.sellPostUserBookmark.deleteMany({
        where: {
          userId: userId,
          sellPostId: sellPostId,
        },
      });
      res.status(204);
      return;
    }
    await client.sellPostUserBookmark.upsert({
      create: {
        sellPostId: sellPostId,
        userId: userId,
      },
      update: {},
      where: {
        userId_sellPostId: {
          userId: userId,
          sellPostId: sellPostId,
        },
      },
    });
    res.status(204);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

async function GET(sellPostId: string, userId: string, req: NextApiRequest, res: NextApiResponse<SellPostUserBookmark>) {
  // const body = SellPostGetBody.parse(req.body);

  try {
    const sellPostBookmark = await client.sellPostUserBookmark.findFirst({
      where: {
        sellPostId: sellPostId,
        userId: userId,
      },
    });
    if (!sellPostBookmark) {
      res.status(404).end();
      return;
    }

    res.status(200).json(sellPostBookmark);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sellPostId, userId } = req.query;
  if (typeof sellPostId !== "string" || typeof userId !== "string") {
    res.status(400).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return await POST(sellPostId, userId, req, res);
    case "GET":
      return await GET(sellPostId, userId, req, res);
    default:
      res.status(405).end();
  }
}
