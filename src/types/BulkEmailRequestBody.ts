export type BulkEmailRequestBody = {
  messageVersions: {
    to: {
      email: string;
      name: string;
    }[];
    /* SendInBlue requires this to be an array.
    But if you do this, every user with this messageVersion will receive the same email.
    So we just create as many messageVersions as there are users.
    */
    params: {
      name: string;
      message: string;
    };
  }[];
};
