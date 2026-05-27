import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  FiArrowLeft, FiPlus, FiSearch, FiDownload, FiMail,
  FiCheckCircle, FiXCircle, FiUser, FiUpload, FiTrash2
} from "react-icons/fi";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const GuestManager = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("all");
  const [filterCheckin, setFilterCheckin] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [addForm, setAddForm] = useState({
    name: "", email: "", phone: "", numberOfGuests: 1,
    isVip: false, notes: "", sendInvitation: false
  });
  const [addLoading, setAddLoading] = useState(false);
  const [qrScanMode, setQrScanMode] = useState(false);
  const [qrInput, setQrInput] = useState("");

  useEffect(() => {
    fetchData();
  }, [eventId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchGuests(), 300);
    return () => clearTimeout(timer);
  }, [search, filterRsvp, filterCheckin]);

  const fetchData = async () => {
    try {
      const [eventRes, guestRes] = await Promise.all([
        api.get(`/api/events/${eventId}`),
        api.get(`/api/guests/event/${eventId}`)
      ]);
      setEvent(eventRes.data.event);
      setGuests(guestRes.data.guests);
      setStats(guestRes.data.stats);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterRsvp !== "all") params.rsvpStatus = filterRsvp;
      if (filterCheckin !== "all") params.checkInStatus = filterCheckin;
      const { data } = await api.get(`/api/guests/event/${eventId}`, { params });
      setGuests(data.guests);
      setStats(data.stats);
    } catch (error) { /* silent */ }
  }, [eventId, search, filterRsvp, filterCheckin]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const { data } = await api.post("/api/guests", { ...addForm, event: eventId });
      setGuests((prev) => [data.guest, ...prev]);
      setStats((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
      toast.success("Guest added successfully");
      setShowAddModal(false);
      setAddForm({ name: "", email: "", phone: "", numberOfGuests: 1, isVip: false, notes: "", sendInvitation: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add guest");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRsvpUpdate = async (guestId, status) => {
    try {
      const { data } = await api.put(`/api/guests/${guestId}/rsvp`, { rsvpStatus: status });
      setGuests((prev) => prev.map((g) => (g._id === guestId ? data.guest : g)));
      toast.success(`RSVP updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update RSVP");
    }
  };

  const handleCheckIn = async (guestId) => {
    try {
      const { data } = await api.put(`/api/guests/${guestId}/checkin`);
      setGuests((prev) => prev.map((g) => (g._id === guestId ? data.guest : g)));
      toast.success("Guest checked in!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed");
    }
  };

  const handleQRCheckin = async () => {
    if (!qrInput.trim()) return;
    try {
      const { data } = await api.post("/api/guests/checkin-by-qr", { qrCode: qrInput, eventId });
      toast.success(`${data.guest.name} checked in!`);
      setQrInput("");
      fetchGuests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid QR code");
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm("Remove this guest?")) return;
    try {
      await api.delete(`/api/guests/${guestId}`);
      setGuests((prev) => prev.filter((g) => g._id !== guestId));
      toast.success("Guest removed");
    } catch (error) {
      toast.error("Failed to remove guest");
    }
  };

  const handleBulkInvite = async () => {
    if (selectedGuests.length === 0) { toast.error("Select guests first"); return; }
    try {
      await api.post(`/api/guests/bulk-invite/${eventId}`, { guestIds: selectedGuests });
      toast.success(`Invitations sent to ${selectedGuests.length} guests`);
      setSelectedGuests([]);
    } catch (error) {
      toast.error("Failed to send invitations");
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/api/guests/event/${eventId}/export/${format}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `guests.${format === "excel" ? "xlsx" : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const getRsvpColor = (status) => {
    const colors = { confirmed: "#10B981", declined: "#EF4444", pending: "#F59E0B", waitlisted: "#6B7280", maybe: "#3B82F6" };
    return colors[status] || "#9CA3AF";
  };

  const cardStyle = {
    background: isDark ? "#1a1a2e" : "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center", color: "#6B7280" }}>Loading guests...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f0f23" : "#f9fafb", color: isDark ? "#eaeaea" : "#1f2937" }}>
      {/* Header */}
      <div style={{ background: isDark ? "#1a1a2e" : "white", padding: "20px 30px", borderBottom: `1px solid ${isDark ? "#2d2d3a" : "#e5e7eb"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px" }}>Guest Manager</h1>
            <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>{event?.eventName}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setQrScanMode(!qrScanMode)} style={{ padding: "10px 16px", background: "#E0E7FF", color: "#4F46E5", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
            📷 QR Check-in
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ padding: "10px 16px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiPlus /> Add Guest
          </button>
        </div>
      </div>

      <div style={{ padding: "30px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total", value: stats.total || 0, color: "#4F46E5" },
            { label: "Confirmed", value: stats.confirmed || 0, color: "#10B981" },
            { label: "Pending", value: stats.pending || 0, color: "#F59E0B" },
            { label: "Declined", value: stats.declined || 0, color: "#EF4444" },
            { label: "Checked In", value: stats.checkedIn || 0, color: "#3B82F6" },
            { label: "Waitlisted", value: stats.waitlisted || 0, color: "#6B7280" }
          ].map((s) => (
            <div key={s.label} style={{ ...cardStyle, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* QR Scan Mode */}
        {qrScanMode && (
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 16px" }}>📷 QR Code Check-in</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQRCheckin()}
                placeholder="Scan or enter QR code..."
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937" }}
                autoFocus
              />
              <button onClick={handleQRCheckin} style={{ padding: "10px 20px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Check In
              </button>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="text"
                placeholder="Search guests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937", boxSizing: "border-box" }}
              />
            </div>
            <select value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937" }}>
              <option value="all">All RSVP</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="maybe">Maybe</option>
            </select>
            <select value={filterCheckin} onChange={(e) => setFilterCheckin(e.target.value)} style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937" }}>
              <option value="all">All Check-in</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
            </select>

            {selectedGuests.length > 0 && (
              <button onClick={handleBulkInvite} style={{ padding: "10px 16px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiMail /> Invite ({selectedGuests.length})
              </button>
            )}

            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              {["csv", "excel", "pdf"].map((fmt) => (
                <button key={fmt} onClick={() => handleExport(fmt)} style={{ padding: "8px 12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiDownload size={12} /> {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guest Table */}
        <div style={cardStyle}>
          {guests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              <FiUser size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
              <p>No guests found</p>
              <button onClick={() => setShowAddModal(true)} style={{ padding: "10px 20px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "12px" }}>
                Add First Guest
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${isDark ? "#2d2d3a" : "#e5e7eb"}` }}>
                    <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>
                      <input type="checkbox" onChange={(e) => setSelectedGuests(e.target.checked ? guests.map((g) => g._id) : [])} checked={selectedGuests.length === guests.length && guests.length > 0} />
                    </th>
                    {["Guest", "Email", "RSVP", "Check-in", "Ticket", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest._id} style={{ borderBottom: `1px solid ${isDark ? "#2d2d3a" : "#f3f4f6"}` }}>
                      <td style={{ padding: "12px 8px" }}>
                        <input
                          type="checkbox"
                          checked={selectedGuests.includes(guest._id)}
                          onChange={(e) => setSelectedGuests(e.target.checked ? [...selectedGuests, guest._id] : selectedGuests.filter((id) => id !== guest._id))}
                        />
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4F46E5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", flexShrink: 0 }}>
                            {guest.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: "500", fontSize: "14px" }}>
                              {guest.name}
                              {guest.isVip && <span style={{ marginLeft: "6px", background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "10px", fontSize: "10px" }}>VIP</span>}
                            </div>
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>{guest.numberOfGuests} guest{guest.numberOfGuests > 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "14px", color: "#6B7280" }}>{guest.email}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <select
                          value={guest.rsvpStatus}
                          onChange={(e) => handleRsvpUpdate(guest._id, e.target.value)}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "none", background: getRsvpColor(guest.rsvpStatus) + "20", color: getRsvpColor(guest.rsvpStatus), fontWeight: "600", fontSize: "12px", cursor: "pointer" }}
                        >
                          {["pending", "confirmed", "declined", "waitlisted", "maybe"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        {guest.checkInStatus === "checked-in" ? (
                          <span style={{ color: "#10B981", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <FiCheckCircle /> Checked In
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(guest._id)}
                            style={{ padding: "4px 10px", background: "#D1FAE5", color: "#059669", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                          >
                            Check In
                          </button>
                        )}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "12px", color: "#6B7280", fontFamily: "monospace" }}>
                        {guest.ticketCode}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setShowQR(guest)}
                            title="View QR Code"
                            style={{ padding: "4px 8px", background: "#E0E7FF", color: "#4F46E5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                          >
                            QR
                          </button>
                          <button
                            onClick={() => handleDelete(guest._id)}
                            title="Remove Guest"
                            style={{ padding: "4px 8px", background: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: "6px", cursor: "pointer" }}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: isDark ? "#1a1a2e" : "white", borderRadius: "16px", padding: "30px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 24px" }}>Add Guest</h2>
            <form onSubmit={handleAddGuest}>
              {[
                { label: "Full Name *", name: "name", type: "text", placeholder: "Guest full name" },
                { label: "Email *", name: "email", type: "email", placeholder: "guest@email.com" },
                { label: "Phone", name: "phone", type: "tel", placeholder: "+1 234 567 8900" }
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={addForm[field.name]}
                    onChange={(e) => setAddForm({ ...addForm, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.label.includes("*")}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={addForm.numberOfGuests}
                  onChange={(e) => setAddForm({ ...addForm, numberOfGuests: parseInt(e.target.value) })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Notes</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Any special notes..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", background: isDark ? "#0f0f23" : "white", color: isDark ? "#eaeaea" : "#1f2937", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <input type="checkbox" checked={addForm.isVip} onChange={(e) => setAddForm({ ...addForm, isVip: e.target.checked })} />
                  VIP Guest
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <input type="checkbox" checked={addForm.sendInvitation} onChange={(e) => setAddForm({ ...addForm, sendInvitation: e.target.checked })} />
                  Send Invitation Email
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} style={{ flex: 1, padding: "12px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
                  {addLoading ? "Adding..." : "Add Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: isDark ? "#1a1a2e" : "white", borderRadius: "16px", padding: "30px", textAlign: "center", maxWidth: "320px", width: "100%" }}>
            <h3 style={{ margin: "0 0 8px" }}>{showQR.name}</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 20px" }}>{showQR.ticketCode}</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <QRCodeSVG value={showQR.qrCode} size={200} level="H" />
            </div>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px" }}>
              RSVP: <strong style={{ color: getRsvpColor(showQR.rsvpStatus) }}>{showQR.rsvpStatus}</strong>
            </p>
            <button onClick={() => setShowQR(null)} style={{ padding: "10px 24px", background: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManager;
