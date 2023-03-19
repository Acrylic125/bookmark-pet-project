import sibClient from "src/utils/sib.js";
import { Response } from "@/types/Response";
import { BulkEmailRequestBody } from "@/types/BulkEmailRequestBody";
import getAPIKey from "./api-key/getAPIKey";

/* This function sends email notifications to multiple recipients.
It is called by the bulk-notification-v2 endpoint.
*/

export default async function sendNotificationEmail(
  parameters: BulkEmailRequestBody
): Promise<Response> {
  const data: BulkEmailRequestBody = parameters;

  console.log(data);

  console.log("Sending email to:");
  data.messageVersions.forEach((body) => {
    console.log(body.to[0].email);
  });

  const apiInstance = new sibClient.TransactionalEmailsApi();

  const apiKey = sibClient.authentications["api-key"];
  apiKey.apiKey = getAPIKey(data.messageVersions.length);

  const email = {
    sender: {
      email: process.env.SIB_SENDER_EMAIL,
      name: process.env.SIB_SENDER_NAME,
    },
    subject: "SIWMA Listing Alerts",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Listing Alerts</h1>
        <p>Hi {name},</p>
        <p>Here are your latest alerts:</p>
        {message}
        <p><a href="http://localhost:3000/unsubscribe">Manage your Alert Preferences</a></p>
      </body>
      </html>
      `,
    messageVersions: data.messageVersions,
  };

  console.log(email);

  try {
    await apiInstance.sendTransacEmail(email);
    return {
      success: true,
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "An unexpected error occurred while sending the email.",
    };
  }
}
