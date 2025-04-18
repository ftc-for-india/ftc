import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Container, Typography, Box, CircularProgress, Button } from "@mui/material";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        {loading ? (
          <CircularProgress />
        ) : profile ? (
          <Box>
            <Typography variant="body1"><strong>Name:</strong> {profile.name}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {profile.email}</Typography>
            <Typography variant="body1"><strong>Role:</strong> {profile.role}</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Edit Profile (Coming Soon)</Button>
          </Box>
        ) : (
          <Typography variant="body1">Unable to load profile data.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;
