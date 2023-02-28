import { Container, Box, Typography, Grid, Stack, useTheme, Button, Chip, IconButton } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MainLayout from "@/components/MainLayout";
import { useQuery } from "react-query";
import { z } from "zod";
import Link from "next/link";

function SellPostListing({ name, bookmarked, soldOut }: { name: string; bookmarked?: boolean; soldOut?: boolean }) {
  return (
    <Stack
      sx={{
        width: "100%",
        overflow: "hidden",
        borderColor: "grey.200",
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 2,
        "&:hover": {
          borderColor: "primary.300",
        },
      }}
    >
      <Box
        sx={({ breakpoints }) => ({
          width: "100%",
          height: "50%",
          minHeight: 156,
          [breakpoints.up("md")]: {
            minHeight: 186,
          },
          [breakpoints.up("lg")]: {
            minHeight: 216,
          },
          position: "relative",
        })}
      >
        <Image
          src="/No_Image_Available.jpg"
          alt="No Image"
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </Box>
      <Stack
        sx={({ spacing }) => ({
          width: "100%",
          justifyContent: "space-between",
          padding: spacing(2),
        })}
        spacing={1}
      >
        <Stack
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            color: "grey.300",
          }}
          direction="row"
        >
          {soldOut && (
            <Chip
              sx={{
                backgroundColor: "error.50",
                color: "error.500",
              }}
              size="small"
              label="Sold Out"
            />
          )}
        </Stack>
        <Stack
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
          direction="row"
        >
          <Typography
            sx={{
              fontWeight: "bold",
              color: "grey.800",
              wordBreak: "break-word",
            }}
            component="h5"
            variant="h6"
          >
            {name}
          </Typography>
          {/* <IconButton>{bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon color="inherit" />}</IconButton> */}
        </Stack>
        <Stack
          sx={{
            color: "primary.300",
          }}
          direction="row"
        >
          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            View
          </Typography>
          <ChevronRightIcon />
        </Stack>
      </Stack>
    </Stack>
  );
}

const SellPostSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["available", "sold_out"]),
});
const SellPostArraySchema = z.array(SellPostSchema);

export default function Home() {
  const { data: sellPosts } = useQuery(["sellPosts"], async () => {
    const resp = await fetch("/api/sell-post", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await resp.json();

    return SellPostArraySchema.parse(data);
  });

  return (
    <>
      <Head>
        <title>Bookmark Test</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <MainLayout>
          <Container
            sx={{
              paddingY: ({ spacing }) => spacing(2),
            }}
            maxWidth="xl"
          >
            <Stack
              sx={{
                paddingY: ({ spacing }) => spacing(2),
              }}
              gap={2}
            >
              <Stack
                sx={{
                  justifyContent: "space-between",
                }}
                spacing={1}
                direction="row"
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                  }}
                  component="h1"
                  variant="h5"
                >
                  Sell Posts
                </Typography>
                <Link href="/sell-post/create">
                  <Button variant="contained">Create</Button>
                </Link>
              </Stack>
              {sellPosts && sellPosts.length > 0 && (
                <Grid container spacing={1}>
                  {sellPosts.map((post) => {
                    return (
                      <Grid item key={post.id} xs={12} sm={6} md={4} lg={3}>
                        <Link
                          style={{
                            textDecoration: "none",
                          }}
                          href={`/sell-post/${post.id}`}
                        >
                          <SellPostListing name={post.name} />
                        </Link>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Stack>
          </Container>
        </MainLayout>
      </main>
    </>
  );
}
