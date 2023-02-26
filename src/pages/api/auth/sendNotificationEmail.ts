// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import sibClient from "@sendinblue/client";
import { getSession  } from "next-auth/react";


type Response = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
    return;
  }

  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  if (!session.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const user = session.user;

  if (!user || user.role !== 0) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });``
    return;
  }

  let emailID: string, name: string, message: string;
  emailID = req.body.emailID;
  name = req.body.name;
  message = req.body.message;

  if (!emailID || !name || !message) {
    res.status(400).json({
      success: false,
      message: "Missing parameters",
    });
  }

  const apiInstance = new sibClient.TransactionalEmailsApi();
  let sendSmtpEmail = new sibClient.SendSmtpEmail();

  sendSmtpEmail = {
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
        <p>Here are the latest listings for you:</p>
        <p>${message}</p>
        <p><a href="http://localhost:3000/unsubscribe">Manage your alert preferences</a></p>
      </body>
      </html>
      `,
    params: {},
    headers: {},
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while sending the email.",
    });
  }
}
