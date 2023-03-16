import { NextApiRequest, NextApiResponse } from "next";
import sibClient from "src/utils/sib.js";
import { Response } from "@/types/Response";
import { EmailRequestBody } from "@/types/EmailRequestBody";

/* This endpoint sends a single email to a single recipient.
In practice, it will likely not be used, as the bulk email endpoint will be used instead.
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
// export default async function sendNotificationEmail(parameters: EmailRequestBody): Promise<Response> {
  const parameters: EmailRequestBody = req.body;
  const { emailID, name, message }: EmailRequestBody = parameters;
  console.log("Sending email to " + emailID);

  const apiInstance = new sibClient.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [
      {
        email: emailID,
        name: name,
      },
    ],
    sender: {
      email: process.env.SIB_SENDER_EMAIL,
      name: process.env.SIB_SENDER_NAME,
    },
    subject: "Listing Alerts",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Listing Alerts</h1>
        <p>Hi ${name},</p>
        <p>Here are your latest alerts:</p>
        ${message}
        <p><a href="http://localhost:3000/unsubscribe">Manage your Alert Preferences</a></p>
      </body>
      </html>
      `,
    params: {
      name: name,
      message: message,
    },
    headers: {
      "X-Mailin-custom": "",
    },
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return {
      success: true,
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "An unexpected error occurred while sending the email."
    };
  }
}
