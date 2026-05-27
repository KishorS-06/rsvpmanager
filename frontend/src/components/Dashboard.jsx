import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Dashboard.css";
import { toast } from "react-hot-toast";
import {
  FiCalendar, FiUsers, FiTrendingUp, FiPlus, FiSearch,
  FiLogOut, FiBell, FiDollarSign, FiBarChart2, FiEdit2,
  FiTrash2, FiCopy, FiEye, FiCheckCircle
} from "react-icons/fi";
import { ThemeContext } from "../context/ThemeContext";
import { NotificationContext } from "../context/NotificationContext";
import useAuthStore from "../store/authStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const RSVP_COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6B7280", "#3B82F6"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useContext(NotificationContext) || {};
  const { user, logout } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, filterCategory]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/api/users/dashboard-stats");
      setStats(response.data.stats);
      setEvents(response.data.recentEvents || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterCategory !== "all") params.category = filterCategory;
      const response = await api.get("/api/events", { params });
      setEvents(response.data.events || []);
    } catch (error) {
      // silent
    }
  }, [searchTerm, filterStatus, filterCategory]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    setDeletingId(eventId);
    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      toast.success("Event deleted");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloneEvent = async (eventId, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/api/events/${eventId}/clone`);
      toast.success("Event cloned successfully");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to clone event");
    }
  };

  const handlePublishEvent = async (eventId, currentStatus, e) => {
    e.stopPropagation();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await api.put(`/api/events/${eventId}`, { status: newStatus });
      setEvents((prev) =>
        prev.map((ev) => (ev._id === eventId ? { ...ev, status: newStatus } : ev))
      );
      toast.success(`Event ${newStatus === "published" ? "published" : "unpublished"}`);
    } catch (error) {
      toast.error("Failed to update event status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      published: "#10B981", draft: "#F59E0B", ongoing: "#3B82F6",
      completed: "#6B7280", cancelled: "#EF4444"
    };
    return colors[status] || "#9CA3AF";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      conference: "🎤", workshop: "🛠️", party: "🎉", wedding: "💒",
      concert: "🎵", sports: "⚽", meetup: "👥", corporate: "🏢",
      fundraiser: "💝", festival: "🎪", other: "📅"
    };
    return icons[category] || "📅";
  };

  // Chart data
  const rsvpChartData = stats
    ? [
        { name: "Confirmed", value: stats.confirmedGuests, color: "#10B981" },
        { name: "Pending", value: stats.pendingGuests, color: "#F59E0B" },
        { name: "Declined", value: stats.declinedGuests, color: "#EF4444" }
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <div className={`dashboard-container ${isDark ? "dark" : ""}`}>
        <div className="loading-spinner">
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "40px", height: "40px", border: "4px solid #e5e7eb",
              borderTop: "4px solid #4F46E5", borderRadius: "50%",
              animation: "spin 1s linear infinite", margin: "0 auto 16px"
            }} />
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDark ? "dark" : ""}`}>
      {/* Page title bar */}
      <div style={{ padding: "24px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: isDark ? "#eaeaea" : "#1a1035" }}>
            My Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: 14 }}>
            Welcome back, {user?.profile?.firstName || user?.username}! 👋
          </p>
        </div>
        <button onClick={() => navigate("/eventname")} className="create-event-btn">
          <FiPlus /> New Event
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-events"><FiCalendar /></div>
            <div className="stat-info"><h3>{stats.totalEvents}</h3><p>Total Events</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming-events"><FiCalendar /></div>
            <div className="stat-info"><h3>{stats.upcomingEvents}</h3><p>Upcoming</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total-guests"><FiUsers /></div>
            <div className="stat-info"><h3>{stats.totalGuests}</h3><p>Total Guests</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed-guests"><FiTrendingUp /></div>
            <div className="stat-info"><h3>{stats.confirmedGuests}</h3><p>Confirmed RSVPs</p></div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {stats && stats.totalGuests > 0 && (
        <div style={{ padding: "20px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)", border: "1px solid rgba(108,63,197,0.10)", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(108,63,197,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: isDark ? "#eaeaea" : "#1a1035", display: "flex", alignItems: "center", gap: 8 }}>
              <FiBarChart2 /> RSVP Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={rsvpChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {rsvpChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)", border: "1px solid rgba(108,63,197,0.10)", borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(108,63,197,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: isDark ? "#eaeaea" : "#1a1035" }}>📊 Quick Stats</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Past Events",    value: stats.pastEvents,     color: "#6B7280" },
                { label: "Pending RSVPs",  value: stats.pendingGuests,  color: "#F59E0B" },
                { label: "Declined RSVPs", value: stats.declinedGuests, color: "#EF4444" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(108,63,197,0.06)" }}>
                  <span style={{ color: "#6B7280", fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 800, color: item.color, fontSize: 22 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-filter">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="party">Party</option>
              <option value="wedding">Wedding</option>
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="meetup">Meetup</option>
              <option value="corporate">Corporate</option>
              <option value="fundraiser">Fundraiser</option>
              <option value="festival">Festival</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="events-section">
        <h2>Your Events</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No events yet</h3>
            <p>Create your first event to get started!</p>
            <button onClick={() => navigate("/eventname")} className="create-first-event-btn">
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event._id}
                className="event-card"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {event.coverImage && (
                  <div className="event-cover">
                    <img src={event.coverImage} alt={event.eventName} loading="lazy" />
                  </div>
                )}
                <div className="event-header">
                  <div className="event-category">{getCategoryIcon(event.category)}</div>
                  <span className="event-status" style={{ backgroundColor: getStatusColor(event.status) }}>
                    {event.status}
                  </span>
                </div>
                <h3>{event.eventName}</h3>
                <div className="event-details">
                  <p><strong>Date:</strong> {event.eventStartDate}</p>
                  <p><strong>Time:</strong> {event.eventStartTime}</p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {event.selectedLocation?.address ||
                      `${event.selectedLocation?.lat?.toFixed(4)}, ${event.selectedLocation?.lng?.toFixed(4)}`}
                  </p>
                </div>
                <div className="event-stats">
                  <span className="stat">
                    <FiUsers /> {event.currentAttendees}
                    {event.capacity ? `/${event.capacity}` : ""}
                  </span>
                  {(event.tags || []).length > 0 && (
                    <div className="tags">
                      {event.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    padding: "8px 16px", display: "flex", gap: "8px",
                    borderTop: `1px solid ${isDark ? "#2d2d3a" : "#f3f4f6"}`
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/events/${event._id}/guests`)}
                    title="Manage Guests"
                    style={{ flex: 1, padding: "6px", background: "#E0E7FF", color: "#4F46E5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    <FiUsers size={12} /> Guests
                  </button>
                  <button
                    onClick={(e) => handlePublishEvent(event._id, event.status, e)}
                    title={event.status === "published" ? "Unpublish" : "Publish"}
                    style={{ flex: 1, padding: "6px", background: event.status === "published" ? "#FEF3C7" : "#D1FAE5", color: event.status === "published" ? "#D97706" : "#059669", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    <FiCheckCircle size={12} /> {event.status === "published" ? "Draft" : "Publish"}
                  </button>
                  <button
                    onClick={(e) => handleCloneEvent(event._id, e)}
                    title="Clone Event"
                    style={{ padding: "6px 10px", background: "#f3f4f6", color: "#6B7280", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    <FiCopy size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteEvent(event._id, e)}
                    title="Delete Event"
                    disabled={deletingId === event._id}
                    style={{ padding: "6px 10px", background: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
