import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => (
  <Box sx={{ backgroundColor: "#2E7D32", padding: "10px", textAlign: "center", color: "white" }}>
    <Typography variant="body2">© {new Date().getFullYear()} Farmer Market. All rights reserved.</Typography>
  </Box>
);

export default Footer;
