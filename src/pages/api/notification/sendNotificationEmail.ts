import sibClient from "src/utils/sib.js";

type Response = {
  success: boolean;
  message?: string;
};

export interface EmailRequestBody {
  emailID: string;
  name: string;
  message: string;
};

export default async function sendNotificationEmail(parameters: EmailRequestBody): Promise<Response> {
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
        <p>${message}</p>
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
