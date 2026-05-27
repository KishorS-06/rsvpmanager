import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Eventname.css";

const CATEGORIES = [
  { value: "conference", label: "Conference", icon: "🎤" },
  { value: "workshop",   label: "Workshop",   icon: "🛠️" },
  { value: "party",      label: "Party",      icon: "🎉" },
  { value: "wedding",    label: "Wedding",    icon: "💒" },
  { value: "concert",    label: "Concert",    icon: "🎵" },
  { value: "sports",     label: "Sports",     icon: "⚽" },
  { value: "meetup",     label: "Meetup",     icon: "👥" },
  { value: "corporate",  label: "Corporate",  icon: "🏢" },
  { value: "fundraiser", label: "Fundraiser", icon: "💝" },
  { value: "festival",   label: "Festival",   icon: "🎪" },
  { value: "other",      label: "Other",      icon: "📅" },
];

const WizardProgress = ({ step }) => (
  <div className="progress-bar">
    {[1,2,3,4,5].map(s => (
      <div key={s} className={`progress-step ${s <= step ? "active" : ""}`} />
    ))}
  </div>
);

const EventName = () => {
  const navigate = useNavigate();
  const [eventName,   setEventName]   = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("other");
  const [tags,        setTags]        = useState("");
  const [capacity,    setCapacity]    = useState("");
  const [isPublic,    setIsPublic]    = useState(true);
  const [error,       setError]       = useState("");

  const handleContinue = () => {
    if (!eventName.trim()) { setError("Please enter an event name."); return; }
    navigate("/eventdetails", {
      state: {
        eventName:   eventName.trim(),
        description: description.trim(),
        category,
        tags:     tags.split(",").map(t => t.trim()).filter(Boolean),
        capacity: capacity ? parseInt(capacity) : null,
        isPublic,
      },
    });
  };

  const inp = { className: "wizard-input" };

  return (
    <div className="event-location-container">
      <h2>✨ Create Your Event</h2>
      <p style={{ textAlign:"center", color:"#6B7280", marginBottom:20 }}>Step 1 of 5 — Basic Information</p>
      <WizardProgress step={1} />

      {/* Event name */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontWeight:600, fontSize:13, color:"#3d2060", marginBottom:6 }}>Event Name *</label>
        <input {...inp} type="text" value={eventName} onChange={e=>{setEventName(e.target.value);setError("");}}
          placeholder="e.g. Annual Tech Conference 2026" maxLength={200} />
        {error && <p className="field-error">{error}</p>}
        <small style={{ color:"#9ca3af" }}>{eventName.length}/200</small>
      </div>

      {/* Description */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontWeight:600, fontSize:13, color:"#3d2060", marginBottom:6 }}>Description</label>
        <textarea {...inp} value={description} onChange={e=>setDescription(e.target.value)}
          placeholder="Tell guests what to expect..." rows={3} maxLength={5000}
          style={{ resize:"vertical" }} />
      </div>

      {/* Category */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontWeight:600, fontSize:13, color:"#3d2060", marginBottom:8 }}>Category</label>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button"
              className={`category-btn ${category === cat.value ? "selected" : ""}`}
              onClick={() => setCategory(cat.value)}>
              <span style={{ fontSize:22 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags + Capacity */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
        <div>
          <label style={{ display:"block", fontWeight:600, fontSize:13, color:"#3d2060", marginBottom:6 }}>Tags (comma-separated)</label>
          <input {...inp} type="text" value={tags} onChange={e=>setTags(e.target.value)} placeholder="tech, free, networking" />
        </div>
        <div>
          <label style={{ display:"block", fontWeight:600, fontSize:13, color:"#3d2060", marginBottom:6 }}>Capacity (optional)</label>
          <input {...inp} type="number" value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="Leave blank = unlimited" min="1" />
        </div>
      </div>

      {/* Public toggle */}
      <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:24, padding:"12px 16px", background:"rgba(108,63,197,0.05)", borderRadius:10, border:"1px solid rgba(108,63,197,0.12)" }}>
        <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} style={{ width:18, height:18, accentColor:"#6C3FC5" }} />
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:"#1a1035" }}>🌐 Public Event</div>
          <div style={{ fontSize:12, color:"#9ca3af" }}>Visible in event discovery for everyone</div>
        </div>
      </label>

      <div className="button-group">
        <button className="btn next-btn" onClick={handleContinue}>Continue →</button>
      </div>
    </div>
  );
};

export default EventName;
