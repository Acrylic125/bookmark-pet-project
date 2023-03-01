// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import { SellPost, SellPostUserBookmark, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { EmailRequestBody } from "@/pages/api/notification/sendNotificationEmail";
import sendNotificationEmail from "@/pages/api/notification/sendNotificationEmail";
// import { getServerSession } from "next-auth";

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

  // const session = await getServerSession(req);
  // if (!session || !session.user) {
  //   res.status(401).end();
  //   return;
  // }

  // log user email
  // console.log("User email:", session.user.email);

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
    const results: (SellPostUserBookmark & { user: User; })[] = await client.sellPostUserBookmark.findMany({
      where: {
        sellPostId: sellPostId,
      },
      include: {
        user: true,
      },
    });

    const emailRequests = results.map(async (result) => {
      const user = result.user;
      if (!user.email) {
        console.log("User does not have an email:", user);
        return;
      }

      console.log("Notifying user:", user.email);

      const requestBody: EmailRequestBody = {
        emailID: user.email,
        name: user.name ?? "there", // If there's no name, the user gets addressed with "Hi there"
        message: `The sell post <h5>"${updated.name}"</h5> is now "${updated.status === "available" ? "Available" : "Sold Out"}".<br><br><a href="http://localhost:3000/sell-post/${updated.id}">Click to check it out.</a>`,
      };

      return await sendNotificationEmail(requestBody);
    });

    const emailResponses = await Promise.all(emailRequests);
    console.log("Email responses:", emailResponses);

    res.status(200).json(updated);
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
