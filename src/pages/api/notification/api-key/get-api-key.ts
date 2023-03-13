import client from "@/utils/prisma";
import { GetAPIKeyResponseBody } from "@/types/GetAPIKeyResponseBody";
import { NextApiRequest, NextApiResponse } from "next";

// This endpoint is exclusively for testing purposes. In production, use the getAPIKey function directly.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAPIKeyResponseBody>
) {
  const numEmails = req.body.numEmails;

  const key = await client.sIBKey.findFirst({
    where: {
      uses: {
        gte: 300 - numEmails,
      },
    },
  });

  if (!key) {
    res.status(500).json({
      success: false
    });
    return;
  }

  res.status(200).json({ success: true, key: key });
}
