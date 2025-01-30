import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EventDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventName } = state || {};

  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    if (!eventName) {
      navigate("/eventname");
    }
  }, [eventName, navigate]);

  const handleContinue = (e) => {
    e.preventDefault();
    if (!eventStartDate || !eventStartTime || !eventEndDate || !eventEndTime) {
      alert("Please fill in all date and time fields.");
      return;
    }

    if (timezone === "" || timezone === "Select your timezone") {
      alert("Please select a timezone.");
      return;
    }

    navigate("/eventlocation", {
      state: {
        eventName,
        eventStartDate,
        eventStartTime,
        eventEndDate,
        eventEndTime,
        timezone,
      },
    });
  };

  return (
    <div>
      <h1>Event Details</h1>
      <form onSubmit={handleContinue}>
        <input
          type="date"
          value={eventStartDate}
          onChange={(e) => setEventStartDate(e.target.value)}
        />
        <input
          type="time"
          value={eventStartTime}
          onChange={(e) => setEventStartTime(e.target.value)}
        />
        <input
          type="date"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
        />
        <input
          type="time"
          value={eventEndTime}
          onChange={(e) => setEventEndTime(e.target.value)}
        />
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
          <option>Select your timezone</option>
          <option value="UTC">UTC</option>
          <option value="PST">PST</option>
          <option value="EST">EST</option>
          <option value="CST">CST</option>
        </select>
        <button type="submit">Next: Event Location</button>
      </form>
    </div>
  );
};

export default EventDetails;
