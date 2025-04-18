import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Admin Dashboard</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} md={6} key={order._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Order ID: {order._id}</Typography>
                  <Typography>Status: {order.status}</Typography>
                  <Typography>Address: {order.address}</Typography>
                  <Typography>Items: {order.items.map((item) => item.name).join(", ")}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard