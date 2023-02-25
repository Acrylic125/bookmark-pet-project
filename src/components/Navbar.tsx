import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";

const Navbar = () => {
  return (
    <Stack
      sx={({ spacing }) => ({
        width: "100%",
        justifyContent: "space-between",
        paddingX: spacing(4),
        backgroundColor: "grey.50",
      })}
      direction="row"
    >
      <Stack direction="row">
        <Link href="/">
          <Box
            sx={({ spacing }) => ({
              paddingY: spacing(2),
              paddingX: spacing(2),
            })}
          >
            <Typography
              sx={{
                color: "grey.500",
                textDecoration: "none",
              }}
              variant="button"
            >
              SELL POSTS
            </Typography>
          </Box>
        </Link>
      </Stack>
      <Stack gap={1} direction="row">
        <Button>Login</Button>
      </Stack>
    </Stack>
  );
};

export default Navbar;
