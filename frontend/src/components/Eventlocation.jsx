import React, { useState } from "react";
import { Map, Marker } from "pigeon-maps";
import { useNavigate, useLocation } from "react-router-dom";
import "../../src/styles/eventlocation.css";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const EventLocation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isDark } = useContext(ThemeContext);

  const [selectedLocation, setSelectedLocation] = useState([37.7749, -122.4194]);
  const [address, setAddress] = useState("");
  const [venueName, setVenueName] = useState("");

  const handleMapClick = ({ latLng }) => {
    setSelectedLocation(latLng);
    // Reverse geocode using Nominatim (free, no API key)
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latLng[0]}&lon=${latLng[1]}&format=json`)
      .then((r) => r.json())
      .then((data) => {
        if (data.display_name) setAddress(data.display_name);
      })
      .catch(() => {});
  };

  const handleNext = () => {
    navigate("/eventurl", {
      state: {
        ...state,
        selectedLocation: {
          lat: selectedLocation[0],
          lng: selectedLocation[1],
          address: address || `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}`,
          venueName
        }
      }
    });
  };

  return (
    <div className="event-location-container" style={{ background: isDark ? "#1a1a2e" : undefined, color: isDark ? "#eaeaea" : undefined }}>
      <h2 className="heading">Select Event Location</h2>
      <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: "20px" }}>
        Step 3 of 5 — Click on the map to set your event location
      </p>

      {/* Progress */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} style={{ flex: 1, height: "4px", borderRadius: "2px", background: step <= 3 ? "#4F46E5" : "#e5e7eb" }} />
        ))}
      </div>

      <Map
        height={400}
        defaultCenter={selectedLocation}
        defaultZoom={11}
        onClick={handleMapClick}
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <Marker width={50} anchor={selectedLocation} color="#4F46E5" />
      </Map>

      <div className="location-info">
        <p>
          <strong>📍 Coordinates:</strong> {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
        </p>
        {address && (
          <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>
            <strong>Address:</strong> {address}
          </p>
        )}
      </div>

      <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
            Venue Name (optional)
          </label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="e.g. Convention Center"
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", boxSizing: "border-box",
              background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
            Address (auto-filled)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Click map to auto-fill"
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", boxSizing: "border-box",
              background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937"
            }}
          />
        </div>
      </div>

      <div className="button-group" style={{ marginTop: "24px" }}>
        <button className="btn back-btn" onClick={() => navigate("/eventdetails", { state })}>
          ← Back
        </button>
        <button className="btn next-btn" onClick={handleNext}>
          Next: Event URL →
        </button>
      </div>
    </div>
  );
};

export default EventLocation;
