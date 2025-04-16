import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API_URL } from "../config/api";

const FarmerProfilePage = () => {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/farmers/${id}`).then(res => setFarmer(res.data));
  }, [id]);

  return farmer ? <h2>{farmer.name}'s Profile</h2> : <p>Loading...</p>;
};

export default FarmerProfilePage;
