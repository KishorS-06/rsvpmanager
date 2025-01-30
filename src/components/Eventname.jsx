import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EventName = () => {
  const [eventName, setEventName] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (eventName.trim() === "") {
      alert("Please enter an event name.");
      return;
    }
    navigate("/eventdetails", { state: { eventName } });
  };

  return (
    <div>
      <h1>Event Setup</h1>
      <h2>What is the name of your event?</h2>
      <input
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        placeholder="Type a descriptive event name..."
      />
      <button onClick={handleContinue}>Continue to Next Step</button>
    </div>
  );
};

export default EventName;
