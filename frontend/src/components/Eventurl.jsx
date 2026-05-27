import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const EventUrl = () => {
  const [eventUrl, setEventUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isDark } = useContext(ThemeContext);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleContinue = () => {
    if (eventUrl.trim() === "") {
      setUrlError("Please enter an event URL");
      return;
    }
    if (!validateUrl(eventUrl)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    navigate("/eventconfirmation", { state: { ...state, eventUrl } });
  };

  return (
    <div style={{
      maxWidth: "600px", margin: "60px auto", padding: "30px",
      background: isDark ? "#1a1a2e" : "white", borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", color: isDark ? "#eaeaea" : "#1f2937"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "8px" }}>Event URL</h1>
      <p style={{ color: "#9ca3af", marginBottom: "24px" }}>Step 4 of 5 — Where can guests learn more?</p>

      {/* Progress */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "30px" }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} style={{ flex: 1, height: "4px", borderRadius: "2px", background: step <= 4 ? "#4F46E5" : "#e5e7eb" }} />
        ))}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Event Website or Registration URL *
        </label>
        <input
          type="url"
          value={eventUrl}
          onChange={(e) => { setEventUrl(e.target.value); setUrlError(""); }}
          placeholder="https://your-event-website.com"
          style={{
            width: "100%", padding: "12px 16px", border: `1px solid ${urlError ? "#EF4444" : "#d1d5db"}`,
            borderRadius: "8px", fontSize: "15px", boxSizing: "border-box",
            background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937"
          }}
        />
        {urlError && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px" }}>{urlError}</p>}
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "8px" }}>
          This is where guests will go to learn more about your event or register externally.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => navigate("/eventlocation", { state })}
          style={{ flex: 1, padding: "12px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          style={{ flex: 2, padding: "12px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}
        >
          Review & Confirm →
        </button>
      </div>
    </div>
  );
};

export default EventUrl;
