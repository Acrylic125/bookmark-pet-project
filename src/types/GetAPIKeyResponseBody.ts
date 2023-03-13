import { SIBKey } from "@prisma/client";

export type GetAPIKeyResponseBody = {
  success: boolean;
  key?: SIBKey;
};
