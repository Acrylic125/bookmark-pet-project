// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import {
  SellPost,
  SellPostUserBookmark,
  User,
  UserNotification,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import sendBulkNotifications from "@/pages/api/notification/bulk-notification-v2";

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

    // Fetch all users from the User table who have bookmarked this sell post
    const results: (SellPostUserBookmark & { user: User } & {
      sellPost: SellPost;
    })[] = await client.sellPostUserBookmark.findMany({
      where: {
        sellPostId: sellPostId,
      },
      include: {
        user: true,
        sellPost: true,
      },
    });

    const notificationRequests: UserNotification[] = [];
    results.map((result) =>
      notificationRequests.push({
        id: "",
        updatedAt: null,
        userId: result.userId,
        originalPostStatus: result.sellPost.status,
        sellPostId: result.sellPostId,
      })
    );

    const emailResponse = await sendBulkNotifications(notificationRequests);

    if (emailResponse.success) {
      res.status(200).json(updated);
    } else {
      res.status(500).end();
    }

    // const emailRequestBody: BulkEmailRequestBody = {
    //   messageVersions: [],
    // };

    // const emailRequests = results.map((result) => {
    //   const user = result.user;
    //   if (!user.email) {
    //     console.log("User does not have an email:", user);
    //     return;
    //   }

    //   console.log("Notifying user:", user.email);

    //   emailRequestBody.messageVersions.push({
    //     // To understand why this is an array, see the comment in /api/notification/bulkSendNotificationEmails.ts
    //     to: [
    //       {
    //         email: user.email,
    //         name: user.name ?? "SIWMA User",
    //       },
    //     ],
    //     params: {
    //       name: user.name ?? "SIWMA User",
    //       message: `The sell post <h5>"${updated.name}"</h5> is now "${
    //         updated.status === "available" ? "Available" : "Sold Out"
    //       }".<br><br><a href="http://localhost:3000/sell-post/${
    //         updated.id
    //       }">Click to check it out.</a>`,
    //     },
    //   });
    // });

    // const emailResponse = await sendNotificationEmail(emailRequestBody);
    // console.log("Email response:", emailResponse.success);
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
