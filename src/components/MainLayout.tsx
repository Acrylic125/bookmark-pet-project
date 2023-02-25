import { Box } from "@mui/material";
import Navbar from "./Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
        }}
      >
        <Navbar />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default MainLayout;
