import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <Link to="/dashboard" style={styles.logo}>🌾 Farmer's Market</Link>
      <div style={styles.navLinks}>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/cart" style={styles.link}><FaShoppingCart /> Cart</Link>
        <Link to="/logout" style={styles.link}><FaSignOutAlt /> Logout</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: { display: "flex", justifyContent: "space-between", padding: "15px", background: "#2E7D32", color: "white" },
  logo: { fontSize: "22px", textDecoration: "none", color: "white" },
  navLinks: { display: "flex", gap: "20px" },
  link: { color: "white", textDecoration: "none", fontSize: "18px" }
};

export default Navbar;
