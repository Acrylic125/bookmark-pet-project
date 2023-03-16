import client from "@/utils/prisma";
import { Response } from "@/types/Response";
import { SellPost, User, UserNotification } from "@prisma/client";
import { BulkEmailRequestBody } from "@/types/BulkEmailRequestBody";
import bulkSendNotificationEmails from "./test/bulkSendNotificationEmails";
import { NextApiRequest, NextApiResponse } from "next";

/* This endpoint sends email notifications to multiple recipients.
In practice, it must only be called by the cron job.
It needs to be protected by a middleware that checks if the user is an admin.
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const data: UserNotification[] = req.body;

  // Filter out all the notifications that were queued less than 5 minutes ago
  const notificationsToSend = existingNotifications.filter((notification) => {
    return notification.updatedAt === null
      ? false
      : notification.updatedAt < new Date(Date.now() - 5 * 60 * 1000);
  });

  console.log(notificationsToSend);

  // Create the BulkEmailRequestBody
  const body: BulkEmailRequestBody = {
    messageVersions: [], // To understand why this is an array, see the comment in /api/notification/bulkSendNotificationEmails.ts
  };

  // Separate the notifications by user, so that we can lump all the updates into a single email
  const notificationsByUser: {
    [key: string]: (UserNotification & {
      User: User;
      SellPost: SellPost;
    })[];
  } = {};

  notificationsToSend.map((notification) => {
    if (notificationsByUser[notification.userId] === undefined) {
      notificationsByUser[notification.userId] = [];
    }
    notificationsByUser[notification.userId].push(notification);
  });

  // Create the message versions
  await Promise.all(
    Object.keys(notificationsByUser).map(async (userId) => {
      try {
        const userNotifications = notificationsByUser[userId];

        const message: string = userNotifications
          .map((notification) => {
            return `The sell post <h5>"${
              notification.SellPost.name
            }"</h5> is now "${
              notification.SellPost.status === "available"
                ? "Available"
                : "Sold Out"
            }". <a href="http://localhost:3000/sell-post/${
              notification.SellPost.id
            }">Click to check it out.</a>`;
          })
          .join("<br><br>");

        const user = notificationsByUser[userId][0].User as User;

        if (user === null || user.email === null) {
          return;
        }

        // Create the message version
        body.messageVersions.push({
          to: [
            {
              email: user.email,
              name: "user",
            },
          ],
          params: {
            name: "user",
            message: message,
          },
        });
      } catch (error) {
        console.log(error);
      }
    })
  );

  console.log("body", body);

  if (body.messageVersions.length === 0) {
    console.log("No notifications to send");
    return {
      success: true,
    };
  }

  const emailResponse = await bulkSendNotificationEmails(body);

  if (emailResponse.success) {
    // Remove the notifications from the database
    await client.userNotification.deleteMany({
      where: {
        id: {
          in: notificationsToSend.map((notification) => notification.id),
        },
      },
    });
  }

  return emailResponse;
}
