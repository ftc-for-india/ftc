import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const socket = io(API_URL);

const OrderTrackingPage = () => {
  const [status, setStatus] = useState("Processing");

  useEffect(() => {
    socket.on("orderUpdated", (newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  return <h2>Order Status: {status}</h2>;
};

export default OrderTrackingPage;
