// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import { SellPost, SellPostUserBookmark } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import scheduleNotificationEmails from "@/pages/api/notification/scheduleNotification";

const UpdateSellPostBookmarkBody = z.object({
  status: z.enum(["available", "sold_out"]),
});

async function PATCH(
  sellPostId: string,
  req: NextApiRequest,
  res: NextApiResponse<SellPost>
) {
  const body = UpdateSellPostBookmarkBody.parse(req.body);

  console.log("Updating sell post status:", sellPostId, body.status);

  try {
    const updated = await client.sellPost.update({
      data: {
        status: body.status,
      },
      where: {
        id: sellPostId,
      },
    });

    const res2 = await scheduleNotificationEmails({
      postID: updated.id,
      originalPostStatus: updated.status,
      newPostStatus: body.status,
    });

    if (res2.success) {
      res.status(200).json(updated);
    } else {
      res.status(500).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

async function GET(
  sellPostId: string,
  req: NextApiRequest,
  res: NextApiResponse<SellPostUserBookmark[]>
) {
  try {
    const sellPost = await client.sellPostUserBookmark.findMany({
      where: {
        sellPostId: sellPostId,
      },
    });
    if (!sellPost) {
      res.status(404).end();
      return;
    }

    res.status(200).json(sellPost);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sellPostId } = req.query;
  if (typeof sellPostId !== "string") {
    res.status(400).end();
    return;
  }

  switch (req.method) {
    case "PATCH":
      return await PATCH(sellPostId, req, res);
    case "GET":
      return await GET(sellPostId, req, res);
    default:
      res.status(405).end();
  }
}
