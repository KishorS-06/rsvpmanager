import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const { state } = useLocation();
  const { newEvent, userToken } = state || {}; // Assuming userToken is passed with state
  const [events, setEvents] = useState([]); // State to hold user events
  const navigate = useNavigate();

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get("https://expence-backend-1.onrender.com/api/user/events", {
        headers: {
          Authorization: `Bearer ${userToken}`, // Add token to the request headers
        },
      });

      // Assuming response contains an array of events
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  // Fetch events when the component is mounted
  useEffect(() => {
    if (userToken) {
      fetchEvents(); // Fetch events initially
    }

    // Set up an interval to refresh events every 30 seconds
    const intervalId = setInterval(() => {
      if (userToken) {
        fetchEvents();
      }
    }, 30000); // Refresh every 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userToken]); // Trigger effect when userToken changes

  // Handle Add Event Button Click
  const handleAddEventClick = () => {
    navigate("/Eventname");
  };

  return (
    <div>
      <h1>Your Dashboard</h1>

      {/* Display new event details if available */}
      {newEvent ? (
        <div>
          <h2>New Event Created!</h2>
          <p><strong>Event Name:</strong> {newEvent.eventName}</p>
          <p><strong>Start Date:</strong> {newEvent.eventStartDate} {newEvent.eventStartTime}</p>
          <p><strong>End Date:</strong> {newEvent.eventEndDate} {newEvent.eventEndTime}</p>
          <p><strong>Timezone:</strong> {newEvent.timezone}</p>
          <p><strong>Location:</strong> Latitude: {newEvent.selectedLocation.lat}, Longitude: {newEvent.selectedLocation.lng}</p>
          <p><strong>Event URL:</strong> <a href={newEvent.eventUrl} target="_blank" rel="noopener noreferrer">{newEvent.eventUrl}</a></p>
        </div>
      ) : (
        <p>No new event created.</p>
      )}

      <button onClick={handleAddEventClick}>Add Event</button>
      

      <h2>Your Events</h2>
      {events.length > 0 ? (
        <div>
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.eventName}</h3>
              <p><strong>Start:</strong> {event.eventStartDate} {event.eventStartTime}</p>
              <p><strong>End:</strong> {event.eventEndDate} {event.eventEndTime}</p>
              <p><strong>Timezone:</strong> {event.timezone}</p>
              <p><strong>Location:</strong> Latitude: {event.selectedLocation.lat}, Longitude: {event.selectedLocation.lng}</p>
              <p><strong>Event URL:</strong> <a href={event.eventUrl} target="_blank" rel="noopener noreferrer">{event.eventUrl}</a></p>
            </div>
          ))}
        </div>
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
};

export default Dashboard;
