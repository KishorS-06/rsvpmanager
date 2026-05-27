import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/LOGO.png";
import './Signup.css';
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.includes("@")) errs.email = "Invalid email format";
    if (formData.username.length < 4) errs.username = "Username must be at least 4 characters";
    if (formData.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/signup", formData);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach((e) => {
          fieldErrors[e.path] = e.msg;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="SignUpCon">
      <div className="SignUpTop">
        <div className="SignLogo">
          <img src={logo} alt="Logo" className="LogoImg" />
        </div>
        <button className="fb_btn" disabled>Log For Free</button>
      </div>

      <div className="or">or</div>

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="email"></label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={loading}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <br />

        <label htmlFor="user"></label>
        <input
          id="user"
          name="username"
          placeholder="Username (min 4 characters)"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          disabled={loading}
          required
        />
        {errors.username && <p className="error">{errors.username}</p>}
        <br />

        <label htmlFor="pass"></label>
        <div style={{ position: "relative" }}>
          <input
            id="pass"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={loading}
            style={{ paddingRight: "40px" }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer", color: "#6B7280"
            }}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}
        <br />

        <button type="submit" className="signUp_btn" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "16px", color: "#6B7280" }}>
        Already have an account? <Link to="/login" style={{ color: "#4F46E5", fontWeight: "600" }}>Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
