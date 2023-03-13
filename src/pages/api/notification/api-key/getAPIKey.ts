import client from "@/utils/prisma";
import { GetAPIKeyResponseBody } from "@/types/GetAPIKeyResponseBody";

export default async function getAPIKey(
  numEmails: number
): Promise<GetAPIKeyResponseBody> {

  const key = await client.sIBKey.findFirst({
    where: {
      uses: {
        gte: 300 - numEmails,
      },
    },
  });

  if (!key) {
    return {
      success: false,
    };
  }

  return({
    success: true,
    key: key
  });
}
