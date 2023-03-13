import client from "@/utils/prisma";
import { Response } from "@/types/Response";
import { SIBKey } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export type GetAPIKeyResponseBody = {
  success: boolean;
  key?: SIBKey;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAPIKeyResponseBody>
) {
  const numEmails = req.body.numEmails;

  const key = await client.sIBKey.findFirst({
    where: {
      uses: {
        lte: 300 - numEmails,
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
