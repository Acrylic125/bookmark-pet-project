// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import client from "@/utils/prisma";
import { SellPost, SellPostUserBookmark, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { EmailRequestBody } from "src/pages/api/sendNotificationEmail";

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
    const results: SellPostUserBookmark &
      {
        user: User;
      }[] = await client.sellPostUserBookmark.findMany({
      where: {
        sellPostId: sellPostId,
      },
      include: {
        user: true,
      },
    });

    /*  Each call to the email endpoint is an asynchronous network call.
     *  map creates an array of promises for each network call.
     *  Promise.all() waits for all promises to resolve before logging the results.
     */

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
        message: `The status of the sell post with id ${sellPostId} has been updated to ${body.status}`,
      };

      const response = await fetch("http://localhost:3000/api/sendNotificationEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(data);
      return data;
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
  // const body = SellPostGetBody.parse(req.body);

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
