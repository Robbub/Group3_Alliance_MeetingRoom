import Box from "@mui/material/Box";

import { AppRoutes } from "./routes";

const App = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AppRoutes />
    </Box>
  );
};

export default App;
