import MainLayout from "@/components/MainLayout";
import { Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { type SellPost as SellPostType } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { z } from "zod";

const SellPostSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "inactive"]),
});

const SellPost = ({ sellPost }: { sellPost: z.infer<typeof SellPostSchema> }) => {
  const {
    query: { sellPostId },
  } = useRouter();
  // const { data: sellPost, isLoading: sellPostIsLoading } = useQuery(["sellPost", sellPostId], async () => {
  //   const resp = await fetch(`/api/sell-post/${sellPostId}`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   if (!resp.ok) {
  //     throw new Error("Failed to fetch sell post");
  //   }
  //   return resp.json();
  // });

  return (
    <MainLayout>
      <Container
        sx={{
          padding: ({ spacing }) => spacing(4),
        }}
        maxWidth="xl"
      >
        <Stack gap={1}>
          <Typography
            sx={{
              fontWeight: "bold",
            }}
            component="h1"
            variant="h4"
          >
            {sellPost.name}
          </Typography>
          <Typography component="p" variant="subtitle1">
            {sellPost.description}
          </Typography>

          <Divider />

          <Stack gap={1}>
            <Typography
              sx={{
                fontWeight: "bold",
              }}
              component="h2"
              variant="h6"
            >
              Seller Actions
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default SellPost;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sellPostId } = context.query;
  const url =
    process.env.NODE_ENV === "development"
      ? `http://${context.req?.headers.host}/api/sell-post/${sellPostId}`
      : `https://${context.req?.headers.host}/api/sell-post/${sellPostId}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    return {
      notFound: true,
    };
  }

  const sellPost = await resp.json();
  return {
    props: {
      sellPost: SellPostSchema.parse(sellPost),
    },
  };
};
