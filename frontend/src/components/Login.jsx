import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";
import pic from "../assets/loginimg.jpg";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = "Username is required";
    if (!formData.password.trim()) errs.password = "Password is required";
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
      const response = await api.post("/api/login", formData);
      const { token, refreshToken, user } = response.data;
      setAuth(user, token, refreshToken);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
      if (error.response?.status === 423) {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <h1>Log in</h1>
        <p>Welcome back! Please enter your details.</p>

        {errors.general && (
          <div className="error-banner">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username or Email</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username or email"
            autoComplete="username"
            disabled={loading}
          />
          {errors.username && <p className="error-text">{errors.username}</p>}

          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              style={{ paddingRight: "40px" }}
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
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button type="submit" className="signUp_btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/forgot-password" className="forgot-password">
          Forgot password?
        </Link>

        <div style={{ margin: "16px 0", textAlign: "center", color: "#9ca3af" }}>— or —</div>

        <button
          onClick={handleGoogleLogin}
          className="google-btn"
          style={{
            width: "100%", padding: "12px", border: "1px solid #d1d5db",
            borderRadius: "8px", background: "white", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", fontSize: "14px", fontWeight: "500", color: "#374151",
            transition: "background 0.2s"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <p className="signup-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <div className="info-box">
          <p>
            Trying to RSVP to an event? You don't need to register!{" "}
            <a href="#">Learn more</a>
          </p>
        </div>
      </div>

      <div className="illustration-section">
        <img src={pic} alt="Illustration" />
        <h2>Welcome to RSVP Manager</h2>
        <p>Industry-leading event software available without an annual commitment.</p>
      </div>
    </div>
  );
};

export default Login;
