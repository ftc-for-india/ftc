import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Container, Typography, Card, CardContent, Grid } from "@mui/material";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/admin/orders`)
      .then(response => setOrders(response.data))
      .catch(error => console.error("Error fetching orders:", error));
  }, []);

  return (
    <Container>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item key={order._id} xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Order ID: {order._id}</Typography>
                <Typography variant="body1">Address: {order.address}</Typography>
                <Typography variant="body2">Items: {order.items.map(item => item.name).join(", ")}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
