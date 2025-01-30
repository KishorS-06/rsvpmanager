import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LOGO.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handlefeatures = () => {
    navigate("/features");
  };
  const handlepricing = () => {
    navigate("/pricing");
  };
  const handlesales = () => {
    navigate("/sales");
  };
  const handlesupport = () => {
    navigate("/support");
  };
  const handleblog = () => {
    navigate("/blog");
  };
  const handlelogin = () => {
    navigate("/login");
  };
  return (
    <header className="navbar">
      <div className="logo">
        <img src={logo} alt="Company Logo" />
      </div>
      <nav className="nav-links">
        <a href="/features" onClick={handlefeatures}>Features</a>
        <a href="/pricing" onClick={handlepricing}>Pricing</a>
        <a href="/sales" onClick={handlesales}>Sales</a>
        <a href="/support" onClick={handlesupport}>Support</a>
        <a href="/blog" onClick={handleblog}>Blog</a>
        <a href="/login" className="login" onClick={handlelogin}>Login</a>
        <button className="demo-btn">Book a Demo</button>
        <button className="signup-btn" onClick={handleSignupClick}>Sign Up Free</button>
      </nav>
    </header>
  );
};

export default Navbar;