import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const EventLocation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { eventName, eventStartDate, eventStartTime, eventEndDate, eventEndTime, timezone } = state || {};

  const [selectedLocation, setSelectedLocation] = useState({ lat: 37.7749, lng: -122.4194 });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  });

  if (!isLoaded) return <div>Loading...</div>;

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  };

  const handleNext = () => {
    navigate("/eventurl", {
      state: {
        eventName,
        eventStartDate,
        eventStartTime,
        eventEndDate,
        eventEndTime,
        timezone,
        selectedLocation,
      },
    });
  };

  return (
    <div>
      <button onClick={() => navigate("/eventdetails")}>Back</button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedLocation}
        zoom={10}
        onClick={handleMapClick}
      >
        <Marker position={selectedLocation} />
      </GoogleMap>
      <button onClick={handleNext}>Next: Event URL</button>
    </div>
  );
};

export default EventLocation;
