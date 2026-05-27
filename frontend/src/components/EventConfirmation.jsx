import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiCheck, FiCalendar, FiMapPin, FiClock, FiLink } from "react-icons/fi";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const EventConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  const {
    eventName, eventStartDate, eventStartTime, eventEndDate, eventEndTime,
    timezone, selectedLocation, eventUrl, description, category, tags, capacity
  } = state || {};

  const handleSubmit = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please log in to create an event");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        eventName, eventStartDate, eventStartTime, eventEndDate, eventEndTime,
        timezone, selectedLocation, eventUrl, description, category, tags, capacity,
        status: publishNow ? "published" : "draft"
      };

      const response = await api.post("/api/events", eventData);

      if (response.status === 201) {
        toast.success(`Event ${publishNow ? "published" : "saved as draft"} successfully!`);
        navigate("/dashboard", { state: { newEvent: response.data.event } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: isDark ? "#1a1a2e" : "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  };

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f0f23" : "#f9fafb", color: isDark ? "#eaeaea" : "#1f2937", padding: "30px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "30px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>Review Your Event</h1>
            <p style={{ margin: "4px 0 0", color: "#9ca3af" }}>Step 5 of 5 — Confirm and create</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "30px" }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} style={{ flex: 1, height: "4px", borderRadius: "2px", background: step <= 5 ? "#4F46E5" : "#e5e7eb" }} />
          ))}
        </div>

        {/* Event Summary */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 20px", fontSize: "22px" }}>{eventName}</h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FiCalendar style={{ color: "#4F46E5", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Start</div>
                <div style={{ fontWeight: "500" }}>{eventStartDate} at {eventStartTime}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FiCalendar style={{ color: "#4F46E5", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>End</div>
                <div style={{ fontWeight: "500" }}>{eventEndDate} at {eventEndTime}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FiClock style={{ color: "#4F46E5", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Timezone</div>
                <div style={{ fontWeight: "500" }}>{timezone}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FiMapPin style={{ color: "#4F46E5", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Location</div>
                <div style={{ fontWeight: "500" }}>
                  {selectedLocation?.address || `Lat: ${selectedLocation?.lat?.toFixed(4)}, Lng: ${selectedLocation?.lng?.toFixed(4)}`}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FiLink style={{ color: "#4F46E5", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Event URL</div>
                <a href={eventUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#4F46E5", fontWeight: "500" }}>
                  {eventUrl}
                </a>
              </div>
            </div>

            {category && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#4F46E5", marginTop: "2px" }}>🏷️</span>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Category</div>
                  <div style={{ fontWeight: "500", textTransform: "capitalize" }}>{category}</div>
                </div>
              </div>
            )}

            {capacity && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#4F46E5", marginTop: "2px" }}>👥</span>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>Capacity</div>
                  <div style={{ fontWeight: "500" }}>{capacity} guests</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Publish Option */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Publishing Options</h3>
          <div style={{ display: "flex", gap: "16px" }}>
            <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: `2px solid ${!publishNow ? "#4F46E5" : "#e5e7eb"}`, borderRadius: "10px", cursor: "pointer" }}>
              <input type="radio" checked={!publishNow} onChange={() => setPublishNow(false)} />
              <div>
                <div style={{ fontWeight: "600" }}>Save as Draft</div>
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>Publish later when ready</div>
              </div>
            </label>
            <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: `2px solid ${publishNow ? "#4F46E5" : "#e5e7eb"}`, borderRadius: "10px", cursor: "pointer" }}>
              <input type="radio" checked={publishNow} onChange={() => setPublishNow(true)} />
              <div>
                <div style={{ fontWeight: "600" }}>Publish Now</div>
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>Make it live immediately</div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ flex: 1, padding: "14px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "500", fontSize: "15px" }}
          >
            ← Edit Details
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 2, padding: "14px", background: "#4F46E5", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              "Creating Event..."
            ) : (
              <><FiCheck /> {publishNow ? "Publish Event" : "Save as Draft"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventConfirmation;
