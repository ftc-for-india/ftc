import React from "react";
import { Box, Typography } from "@mui/material";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import "../styles/animatedLogo.css"; // Custom CSS for animation

const AnimatedLogo = () => {
  return (
    <Box className="logo-container">
      <Box className="logo-icon-wrapper">
        <AgricultureIcon className="logo-icon" />
      </Box>
      <Typography variant="h17" className="logo-text">
        Farmers To Consumers
      </Typography>
    </Box>
  );
};

export default AnimatedLogo;
