import client from "@/utils/prisma";
import { Response } from "@/types/Response";
import { NextApiRequest, NextApiResponse } from "next";

/* This endpoint resets the uses field in all rows of the SIBKey table to 300.
It is meant to be called by the cron job at 0800 GMT every day.
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  client.sIBKey.updateMany({
    where: {},
    data: {
      uses: 300,
    },
  });

  res.status(200).json({
    success: true,
  });
}