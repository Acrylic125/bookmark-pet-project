import client from "@/utils/prisma";
import { Response } from "@/types/Response";
import { SellPost, User, UserNotification } from "@prisma/client";
import { BulkEmailRequestBody } from "@/types/BulkEmailRequestBody";
import bulkSendNotificationEmails from "./bulkSendNotificationEmails";
import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Response>
// ) {
export default async function sendBulkNotifications(
  data: UserNotification[]
): Promise<Response> {
  // const data: UserNotification[] = req.body;

  const testMode: boolean = true;

  /* Adds all the notifications to the database.
    If the status of the post changes back to the original, then remove the notification from the database.
    If the status of the post changes to a different status, just update the notification in the database.
    If notifications were queued 5 minutes or more ago, send emails with SIB and then remove the notifications from the database.
    If notifications were queued less than 5 minutes ago and there have been no changes to the post, do nothing.
    */

  // Fetch all the notifications from the database
  const existingNotifications = await client.userNotification.findMany({
    include: {
      User: true,
      SellPost: true,
    },
  });

  // testMode is used to prevent the database from being updated when running tests
  if (!testMode && data.length > 0) {
    // Create array of notifications without the id
    const notificationsWithoutId = data.map((notification) => {
      return {
        userId: notification.userId,
        originalPostStatus: notification.originalPostStatus,
        sellPostId: notification.sellPostId,
      };
    });

    // Add all the notifications to the database, skipping duplicates
    await client.userNotification.createMany({
      data: notificationsWithoutId,
      skipDuplicates: true, // Uniqueness is determined by the userId
    });

    // Find all the notifications that exist in both arrays
    const notificationsToBeUpdated = existingNotifications.filter(
      (existingNotification) => {
        return data.some(
          (notification) => notification.userId === existingNotification.userId
        );
      }
    );

    if (notificationsToBeUpdated.length > 0) {
      notificationsToBeUpdated.map(async (notification) => {
        // Find the notification in the array of notifications to be added
        const notificationToBeAdded = data.find(
          (notification) => notification.userId === notification.userId
        );

        if (notificationToBeAdded === undefined) {
          return;
        }

        /* For the purposes of this demo project, we assume there are only two statuses: available and sold_out.
    If the status of the post changes at all, it logically means that the post is now back to the original status.
    This means the user does not need to be notified of the change, so we remove the notification from the database.
    
    In an actual production application, there would likely be more statuses, and the user would need to be notified of the change.
    In this case, we would require two db columns: originalPostStatus and currentPostStatus.
    */
        if (
          notificationToBeAdded.originalPostStatus !==
          notification.originalPostStatus
        ) {
          // Remove the notifications from the database
          await client.userNotification.delete({
            where: {
              id: notification.id,
            },
          });
        }

        /*
    // In a production app, we would update the currentPostStatus column with something like this:
    await client.userNotification.update({
      where: {
        id: notification.id,
      },
      data: {
        updatedAt: new Date(),
        originalPostStatus: notification.originalPostStatus,
      },
    });
    */
      });
    }
  }

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
