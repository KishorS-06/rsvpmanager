import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EventUrl = () => {
  const [eventUrl, setEventUrl] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleContinue = () => {
    if (eventUrl.trim() === "") {
      alert("Please enter an event URL.");
      return;
    }

    navigate("/eventconfirmation", { state: { ...state, eventUrl } });
  };

  return (
    <div>
      <h1>Event Setup</h1>
      <h2>Enter Event URL</h2>
      <input
        type="text"
        value={eventUrl}
        onChange={(e) => setEventUrl(e.target.value)}
        placeholder="Enter your event URL"
      />
      <button onClick={handleContinue}>Submit Event</button>
    </div>
  );
};

export default EventUrl;
