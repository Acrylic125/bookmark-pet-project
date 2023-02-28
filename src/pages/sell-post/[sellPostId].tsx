import MainLayout from "@/components/MainLayout";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { Alert, Box, Button, Container, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { type SellPost as SellPostType } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";
import { z } from "zod";
import { authOptions } from "../api/auth/[...nextauth]";

const SellPostSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["available", "sold_out"]),
  sellerId: z.string(),
});

const SellPost = ({ bookmarked: defaultBookmarked, sellPost }: { bookmarked: boolean; sellPost: z.infer<typeof SellPostSchema> }) => {
  const {
    query: { sellPostId },
  } = useRouter();
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState<boolean>(defaultBookmarked);
  const [status, setStatus] = useState<SellPostType["status"]>(sellPost.status);

  const {
    isLoading: updateBookmarkIsLoading,
    error: updateBookmarkError,
    isSuccess: updateBookmarkIsSuccess,
    mutate: updateBookmark,
  } = useMutation(async (newStatus: SellPostType["status"]) => {
    const resp = await fetch(`/api/sell-post/${sellPostId}/bookmark`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });
    if (!resp.ok) {
      throw new Error("Failed to update sell post");
    }
    return resp.json();
  });
  const { mutate: bookmarkSellPost } = useMutation(
    async (newBookmarked: boolean) => {
      if (!session) throw new Error("Not logged in");
      setBookmarked(!bookmarked);
      const resp = await fetch(`/api/sell-post/${sellPostId}/bookmark/${session.user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookmarked: newBookmarked,
        }),
      });
      if (!resp.ok) {
        throw new Error("Failed to bookmark post");
      }
    },
    {
      onMutate: (newBookmarked) => {
        return {
          previousBookmarked: bookmarked,
        };
      },
      onError: (err, newBookmarked, context) => {
        console.error(err);
        if (!context) return;
        setBookmarked(context.previousBookmarked);
      },
    }
  );

  return (
    <MainLayout>
      <Container
        sx={{
          padding: ({ spacing }) => spacing(4),
        }}
        maxWidth="xl"
      >
        <Stack gap={1}>
          <Stack
            sx={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            direction="row"
          >
            <Typography
              sx={{
                fontWeight: "bold",
              }}
              component="h1"
              variant="h4"
            >
              {sellPost.name}
            </Typography>
            {session && (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  bookmarkSellPost(!bookmarked);
                }}
              >
                {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon color="inherit" />}
              </IconButton>
            )}
          </Stack>

          <Typography component="p" variant="subtitle1">
            {sellPost.description}
          </Typography>

          {sellPost.sellerId === session?.user.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBookmark(status);
              }}
            >
              <Stack gap={1}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "grey.700",
                  }}
                  component="h2"
                  variant="h5"
                >
                  Listing Settings
                </Typography>
                <Divider />
                <Stack
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingY: ({ spacing }) => spacing(1),
                  }}
                  direction="row"
                  gap={1}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      color: "grey.400",
                    }}
                    component="h2"
                    variant="h6"
                  >
                    Status
                  </Typography>
                  <FormControl>
                    <InputLabel id="status">Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as SellPostType["status"]);
                      }}
                      labelId="status"
                      label="Status"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="sold_out">Sold Out</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <>
                  {updateBookmarkError && (
                    <Alert severity="error">{updateBookmarkError instanceof Error ? updateBookmarkError.message : "An unknown error occured."}</Alert>
                  )}
                  {updateBookmarkIsSuccess && <Alert severity="success">Updated Sell Post!</Alert>}
                </>
                <Box>
                  <Button type="submit" size="large" variant="contained" disabled={updateBookmarkIsLoading}>
                    Update
                  </Button>
                </Box>
              </Stack>
            </form>
          )}
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default SellPost;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sellPostId } = context.query;
  const session = await getServerSession(context.req, context.res, authOptions);

  const baseUrl = process.env.NODE_ENV === "development" ? `http://${context.req?.headers.host}` : `https://${context.req?.headers.host}`;
  const sellPostResp = await fetch(`${baseUrl}/api/sell-post/${sellPostId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!sellPostResp.ok) {
    return {
      notFound: true,
    };
  }
  const sellPost = await sellPostResp.json();

  let bookmarked = false;
  if (session) {
    const userBookmarkResp = await fetch(`${baseUrl}/api/sell-post/${sellPostId}/bookmark/${session.user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!sellPostResp.ok) {
      return {
        notFound: true,
      };
    }
    const userBookmark = await userBookmarkResp.json();
    bookmarked = userBookmark.bookmarked;
  }

  return {
    props: {
      sellPost: SellPostSchema.parse(sellPost),
      bookmarked,
    },
  };
};
