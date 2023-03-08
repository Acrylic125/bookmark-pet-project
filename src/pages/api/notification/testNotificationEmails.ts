import { NextApiRequest, NextApiResponse } from "next";
import sibClient from "src/utils/sib.js";
import { Response } from "@/types/Response";
import { BulkEmailRequestBody } from "@/types/BulkEmailRequestBody";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const data: BulkEmailRequestBody = {
    messageVersions: [],
  };

  data.messageVersions.push({
    to: [
      {
        email: `acrylic125email@gmail.com`,
        name: `benedict`,
      },
    ],
    params: {
      name: `benedict`,
      message: "sendinblue is pain",
    },
  });

  // Create a list of 99 emails to send to
  for (let i = 0; i < 99; i++) {
    data.messageVersions.push({
      to: [
        {
          email: `test${i}@ksapps.com`,
          name: `Test ${i}`,
        },
      ],
      params: {
        name: `Test ${i}`,
        message: "This is a test email. Disregard it.",
      },
    });
  }

  const apiInstance = new sibClient.TransactionalEmailsApi();

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
        <h1>TEST EMAIL</h1>
        {message}
      </body>
      </html>
      `,
    messageVersions: data.messageVersions,
  };

  try {
    const response = await apiInstance.sendTransacEmail(email)
    .then(function(result: any) {
      console.log(data);
    }, function(error: any) {
      console.error(error);
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
}
