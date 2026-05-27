import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "America/Sao_Paulo", "America/Mexico_City",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
  "Europe/Amsterdam", "Europe/Stockholm", "Europe/Moscow", "Asia/Kolkata", "Asia/Tokyo",
  "Asia/Shanghai", "Asia/Singapore", "Asia/Dubai", "Asia/Seoul", "Asia/Bangkok",
  "Asia/Jakarta", "Asia/Karachi", "Asia/Dhaka", "Africa/Cairo", "Africa/Lagos",
  "Africa/Johannesburg", "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland"
];

const EventDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isDark } = useContext(ThemeContext);

  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!state?.eventName) navigate("/eventname");
  }, [state, navigate]);

  const validate = () => {
    const errs = {};
    if (!eventStartDate) errs.startDate = "Start date is required";
    if (!eventStartTime) errs.startTime = "Start time is required";
    if (!eventEndDate) errs.endDate = "End date is required";
    if (!eventEndTime) errs.endTime = "End time is required";
    if (timezone === "" || timezone === "Select your timezone") errs.timezone = "Please select a timezone";

    if (eventStartDate && eventEndDate) {
      const start = new Date(`${eventStartDate}T${eventStartTime || "00:00"}`);
      const end = new Date(`${eventEndDate}T${eventEndTime || "00:00"}`);
      if (end <= start) errs.endDate = "End date/time must be after start date/time";
    }

    return errs;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    navigate("/eventlocation", {
      state: { ...state, eventStartDate, eventStartTime, eventEndDate, eventEndTime, timezone }
    });
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid #ccc",
    borderRadius: "6px", fontSize: "14px", color: isDark ? "#eaeaea" : "#333",
    background: isDark ? "#0f0f23" : "white", boxSizing: "border-box"
  };

  const errorStyle = { color: "#EF4444", fontSize: "12px", marginTop: "4px" };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: isDark ? "#eaeaea" : "#333" }}>
          Event Details
        </h1>
        <p style={{ color: "#9ca3af" }}>Step 2 of 5 — Date, Time & Timezone</p>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "30px" }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} style={{ flex: 1, height: "4px", borderRadius: "2px", background: step <= 2 ? "#4F46E5" : "#e5e7eb" }} />
        ))}
      </div>

      <form onSubmit={handleContinue} style={{ background: isDark ? "#1a1a2e" : "white", padding: "24px", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", color: isDark ? "#9ca3af" : "#666", marginBottom: "8px" }}>
              Start Date *
            </label>
            <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} style={inputStyle} />
            {errors.startDate && <p style={errorStyle}>{errors.startDate}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", color: isDark ? "#9ca3af" : "#666", marginBottom: "8px" }}>
              Start Time *
            </label>
            <input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} style={inputStyle} />
            {errors.startTime && <p style={errorStyle}>{errors.startTime}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", color: isDark ? "#9ca3af" : "#666", marginBottom: "8px" }}>
              End Date *
            </label>
            <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} min={eventStartDate} style={inputStyle} />
            {errors.endDate && <p style={errorStyle}>{errors.endDate}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", color: isDark ? "#9ca3af" : "#666", marginBottom: "8px" }}>
              End Time *
            </label>
            <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} style={inputStyle} />
            {errors.endTime && <p style={errorStyle}>{errors.endTime}</p>}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", color: isDark ? "#9ca3af" : "#666", marginBottom: "8px" }}>
            Timezone *
          </label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
            <option value="">Select your timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          {errors.timezone && <p style={errorStyle}>{errors.timezone}</p>}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/eventname", { state })}
            style={{ flex: 1, padding: "12px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
          >
            ← Back
          </button>
          <button
            type="submit"
            style={{ flex: 2, padding: "12px", background: "#6b46c1", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}
          >
            Next: Event Location →
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventDetails;
