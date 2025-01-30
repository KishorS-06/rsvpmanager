import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import pic from "../assets/loginimg.jpg";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Corrected: Using useNavigate for redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post("https://expence-backend-1.onrender.com/login", formData);
        alert(response.data.message);
        console.log("Login Successful:", response.data);

        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } catch (error) {
        alert("Login Failed. Please check your username and password.");
        console.error("Login Error:", error.response?.data?.message || error.message);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <h1>Log in</h1>
        <p>Welcome back! Please enter your details.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username"
            value={formData.username} 
            onChange={handleChange} 
            placeholder="Enter your username" 
            required 
          />
          {errors.username && <p className="error-text">{errors.username}</p>}
          
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Enter the password" 
            required 
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button type="submit" className="signUp_btn">Login</button>
        </form>
        <a href="#" className="forgot-password">Forgot password?</a>
        <p className="signup-text">Don't have an account? <a href="/signup">Sign up</a></p>

        <div className="info-box">
          <p>
            Trying to RSVP to an event? You don’t need to register for an Eventmanagement account! 
            <a href="#"> Learn more</a>
          </p>
        </div>
      </div>

      <div className="illustration-section">
        <img src={pic} alt="Illustration" />
        <h2>Welcome to EvRSVPnT</h2>
        <p>Industry-leading event software available without an annual commitment.</p>
      </div>
    </div>
  );
};

export default Login;
