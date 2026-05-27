import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent if email exists");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ justifyContent: "center" }}>
      <div className="login-section" style={{ maxWidth: "480px" }}>
        <h1>Forgot Password</h1>
        {sent ? (
          <div>
            <p style={{ color: "#10B981", marginBottom: "20px" }}>
              ✅ If an account with that email exists, we've sent a password reset link.
            </p>
            <p>Check your inbox and follow the instructions.</p>
            <Link to="/login" style={{ color: "#4F46E5", fontWeight: "600" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
              <button type="submit" className="signUp_btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p style={{ marginTop: "16px" }}>
              <Link to="/login" style={{ color: "#4F46E5" }}>← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
