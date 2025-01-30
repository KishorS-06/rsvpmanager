import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // For making HTTP requests

const EventConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { eventName, eventStartDate, eventStartTime, eventEndDate, eventEndTime, timezone, selectedLocation, eventUrl } = state || {};

  // Get the user token from localStorage
  const userToken = localStorage.getItem("token"); // Ensure "token" is the key used when saving the token

  // Log the token to check if it's present and valid
  console.log("User Token: ", userToken);

  const handleSubmit = async () => {
    try {
      if (!userToken) {
        throw new Error("No token found. Please log in again.");
      }

      // Make a POST request to save the event data to the backend
      const eventData = {
        eventName,
        eventStartDate,
        eventStartTime,
        eventEndDate,
        eventEndTime,
        timezone,
        selectedLocation,
        eventUrl,
      };

      // Send token in the Authorization header
      const response = await axios.post("https://expence-backend-1.onrender.com/api/saveEvent", eventData, {
        headers: {
          Authorization: `Bearer ${userToken}`, // Add token to the request headers
        },
      });

      if (response.status === 200) {
        // On successful save, navigate to the dashboard and pass the event data
        navigate("/dashboard", { state: { newEvent: eventData } });
      } else {
        alert("Failed to save event.");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert(`An error occurred while saving the event: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Event Confirmation</h1>
      <p><strong>Event Name:</strong> {eventName}</p>
      <p><strong>Start Date:</strong> {eventStartDate} {eventStartTime}</p>
      <p><strong>End Date:</strong> {eventEndDate} {eventEndTime}</p>
      <p><strong>Timezone:</strong> {timezone}</p>
      <p><strong>Location:</strong> Latitude: {selectedLocation?.lat}, Longitude: {selectedLocation?.lng}</p>
      <p><strong>Event URL:</strong> <a href={eventUrl} target="_blank" rel="noopener noreferrer">{eventUrl}</a></p>

      <button onClick={handleSubmit}>Submit Event</button>
    </div>
  );
};

export default EventConfirmation;
