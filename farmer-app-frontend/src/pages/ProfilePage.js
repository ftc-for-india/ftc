
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

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
        <Typography variant="h4" gutterBottom textAlign="center">👤 My Profile</Typography>
        {loading ? (
          <Box sx={{ textAlign: "center" }}><CircularProgress /></Box>
        ) : profile ? (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 72, height: 72 }}>
                    <PersonIcon fontSize="large" />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{profile.name}</Typography>
                  <Typography color="text.secondary">{profile.email}</Typography>
                  <Typography color="text.secondary">Role: {profile.role}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body1">Unable to load profile data.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;