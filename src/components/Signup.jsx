import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import logo from "../assets/LOGO.png";
import './Signup.css';
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form validation function
  const validate = () => {
    let newErrors = {};
    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }
    if (formData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      const response = await axios.post("https://expence-backend-1.onrender.com/signup", formData);
      alert(response.data.message);
      console.log("User Data:", formData);
      navigate("/login");
    } else {
      setErrors(validationErrors);
    }
  } catch (error) {
    alert("Signup Failed");
  }
};

  return (
    <div className="SignUpCon">
      <div className="SignUpTop">
        <div className="SignLogo">
          <img src={logo} alt="Logo" className="LogoImg" />
        </div>
        <button className="fb_btn">Log For Free</button>
      </div>
      
      <div className="or">or</div>

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="email"></label>
        <input 
          id="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <br />
        <label htmlFor="user"></label>
        <input 
          id="user" 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange} 
          required
        />
        {errors.username && <p className="error">{errors.username}</p>}
        <br />

        <label htmlFor="pass"></label>
        <input 
          id="pass" 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}
        <br />

        <button type="submit" className="signUp_btn">Sign up</button>
      </form>
    </div>
  );
};

export default Signup;