import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { ThemeContext } from "../context/ThemeContext";
import {
  FiArrowLeft, FiEdit2, FiUsers, FiShare2, FiCalendar,
  FiMapPin, FiClock, FiBarChart2, FiDownload, FiCopy
} from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import SocialShare from "./SocialShare";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const [eventRes, analyticsRes] = await Promise.all([
        api.get(`/api/events/${id}`),
        api.get(`/api/events/${id}/analytics`)
      ]);
      setEvent(eventRes.data.event);
      setStats(eventRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      toast.error("Failed to load event");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCalendar = async (type) => {
    try {
      if (type === "google") {
        const { data } = await api.get(`/api/events/${id}/calendar/google`);
        window.open(data.googleCalendarUrl, "_blank");
      } else {
        const response = await api.get(`/api/events/${id}/calendar/ics`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${event.eventName}.ics`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error("Calendar export failed");
    }
  };

  const cardStyle = {
    background: isDark ? "#1a1a2e" : "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  };

  const rsvpData = analytics
    ? [
        { name: "Confirmed", value: analytics.overview.confirmed, color: "#10B981" },
        { name: "Declined", value: analytics.overview.declined, color: "#EF4444" },
        { name: "Pending", value: analytics.overview.pending, color: "#F59E0B" },
        { name: "Maybe", value: analytics.overview.maybe, color: "#3B82F6" }
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ color: "#6B7280" }}>Loading event...</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f0f23" : "#f9fafb", color: isDark ? "#eaeaea" : "#1f2937" }}>
      {/* Header */}
      <div style={{ background: isDark ? "#1a1a2e" : "white", padding: "20px 30px", borderBottom: `1px solid ${isDark ? "#2d2d3a" : "#e5e7eb"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiArrowLeft /> Back
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px" }}>{event.eventName}</h1>
              <span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", color: "white", background: event.status === "published" ? "#10B981" : event.status === "draft" ? "#F59E0B" : "#6B7280" }}>
                {event.status}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => navigate(`/events/${id}/guests`)} style={{ padding: "10px 16px", background: "#E0E7FF", color: "#4F46E5", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiUsers /> Manage Guests
            </button>
            <button onClick={() => setShowShare(!showShare)} style={{ padding: "10px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiShare2 /> Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginTop: "20px" }}>
          {["overview", "analytics", "calendar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", border: "none", borderRadius: "8px", cursor: "pointer",
                background: activeTab === tab ? "#4F46E5" : "transparent",
                color: activeTab === tab ? "white" : "#6B7280",
                fontWeight: activeTab === tab ? "600" : "normal",
                textTransform: "capitalize"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "30px" }}>
        {/* Social Share Panel */}
        {showShare && (
          <div style={{ ...cardStyle }}>
            <SocialShare
              url={`${window.location.origin}/events/${id}`}
              title={event.eventName}
              description={event.description}
            />
          </div>
        )}

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            <div>
              {/* Cover Image */}
              {event.coverImage && (
                <div style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "20px", height: "240px" }}>
                  <img src={event.coverImage} alt={event.eventName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              {/* Event Info */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 20px" }}>Event Details</h3>
                <div style={{ display: "grid", gap: "16px" }}>
                  {[
                    { icon: <FiCalendar />, label: "Start", value: `${event.eventStartDate} at ${event.eventStartTime}` },
                    { icon: <FiCalendar />, label: "End", value: `${event.eventEndDate} at ${event.eventEndTime}` },
                    { icon: <FiClock />, label: "Timezone", value: event.timezone },
                    { icon: <FiMapPin />, label: "Location", value: event.selectedLocation?.address || `${event.selectedLocation?.lat?.toFixed(4)}, ${event.selectedLocation?.lng?.toFixed(4)}` }
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ color: "#4F46E5", marginTop: "2px" }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>{item.label}</div>
                        <div style={{ fontSize: "14px" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {event.description && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${isDark ? "#2d2d3a" : "#e5e7eb"}` }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#9ca3af" }}>Description</h4>
                    <p style={{ margin: 0, lineHeight: "1.6", fontSize: "14px" }}>{event.description}</p>
                  </div>
                )}

                {(event.tags || []).length > 0 && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {event.tags.map((tag, i) => (
                      <span key={i} style={{ background: "#E0E7FF", color: "#4F46E5", padding: "4px 10px", borderRadius: "12px", fontSize: "12px" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* RSVP Stats */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 16px" }}>RSVP Summary</h3>
                {[
                  { label: "Confirmed", value: stats?.confirmed || 0, color: "#10B981" },
                  { label: "Pending", value: stats?.pending || 0, color: "#F59E0B" },
                  { label: "Declined", value: stats?.declined || 0, color: "#EF4444" },
                  { label: "Waitlisted", value: stats?.waitlisted || 0, color: "#6B7280" }
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${isDark ? "#2d2d3a" : "#f3f4f6"}` }}>
                    <span style={{ fontSize: "14px" }}>{s.label}</span>
                    <span style={{ fontWeight: "700", color: s.color }}>{s.value}</span>
                  </div>
                ))}
                {event.capacity && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Capacity</span>
                      <span>{event.currentAttendees}/{event.capacity}</span>
                    </div>
                    <div style={{ background: "#e5e7eb", borderRadius: "4px", height: "8px" }}>
                      <div style={{ background: "#4F46E5", borderRadius: "4px", height: "100%", width: `${Math.min(100, (event.currentAttendees / event.capacity) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <h3 style={{ margin: "0 0 16px" }}>Event QR Code</h3>
                <QRCodeSVG value={`${window.location.origin}/events/${id}`} size={160} level="H" />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>Scan to view event</p>
              </div>

              {/* Calendar Export */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 16px" }}>Add to Calendar</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={() => handleExportCalendar("google")} style={{ padding: "10px", background: "#4285F4", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    📅 Google Calendar
                  </button>
                  <button onClick={() => handleExportCalendar("ics")} style={{ padding: "10px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <FiDownload /> Download .ICS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div>
            {/* Overview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Guests", value: analytics.overview.totalGuests, color: "#4F46E5" },
                { label: "Confirmed", value: analytics.overview.confirmed, color: "#10B981" },
                { label: "Checked In", value: analytics.overview.checkedIn, color: "#3B82F6" },
                { label: "Revenue", value: `$${analytics.overview.revenue?.toFixed(2) || "0.00"}`, color: "#F59E0B" },
                { label: "Views", value: analytics.eventMetrics.views, color: "#6B7280" },
                { label: "Capacity %", value: `${analytics.overview.capacityUtilization}%`, color: "#EF4444" }
              ].map((s) => (
                <div key={s.label} style={{ ...cardStyle, textAlign: "center", marginBottom: 0 }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {rsvpData.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ margin: "0 0 16px" }}>RSVP Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={rsvpData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {rsvpData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {Object.keys(analytics.dietaryRestrictions || {}).length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ margin: "0 0 16px" }}>Dietary Restrictions</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={Object.entries(analytics.dietaryRestrictions).map(([k, v]) => ({ name: k, count: v }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px" }}>Export to Calendar</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>
                Add this event to your calendar application.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => handleExportCalendar("google")} style={{ padding: "14px", background: "#4285F4", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}>
                  📅 Add to Google Calendar
                </button>
                <button onClick={() => handleExportCalendar("ics")} style={{ padding: "14px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <FiDownload /> Download .ICS File
                </button>
              </div>
            </div>
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <h3 style={{ margin: "0 0 16px" }}>Share Event QR</h3>
              <QRCodeSVG value={`${window.location.origin}/events/${id}`} size={200} level="H" />
              <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "12px" }}>
                Guests can scan this to view the event
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
