import { Box } from "@mui/material";
import Navbar from "./Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "grey.50",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Navbar />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default MainLayout;
