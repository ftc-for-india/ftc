import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const RegisterPage = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, user);
      alert("Registration Successful!");
      navigate("/");
    } catch (error) {
      alert("Registration Failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h4">Register</Typography>
        <TextField fullWidth label="Name" margin="normal" onChange={(e) => setUser({ ...user, name: e.target.value })} />
        <TextField fullWidth label="Email" margin="normal" onChange={(e) => setUser({ ...user, email: e.target.value })} />
        <TextField fullWidth type="password" label="Password" margin="normal" onChange={(e) => setUser({ ...user, password: e.target.value })} />
        <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>Register</Button>
      </Box>
    </Container>
  );
};

export default RegisterPage;
