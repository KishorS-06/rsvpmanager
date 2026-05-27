import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/features.css";

const featuresList = [
  { icon: "🎯", title: "Easy Event Creation",      desc: "Create any type of event in minutes using our intuitive 5-step wizard.",                  color: "#ffecd2,#fcb69f" },
  { icon: "✉️", title: "Email Invitations",         desc: "Send beautifully crafted invites with RSVP tracking and full customization.",              color: "#e8d5ff,#c9b8f5" },
  { icon: "📋", title: "Guest Management",          desc: "Manage your guest list, track RSVPs, add VIP tags, and export to CSV/Excel/PDF.",          color: "#c8f0ff,#b3d9ff" },
  { icon: "📍", title: "QR Check-in System",        desc: "Scan QR codes at the door for instant, duplicate-free guest check-in.",                    color: "#a8edea,#fed6e3" },
  { icon: "📊", title: "Analytics Dashboard",       desc: "Track attendee data, RSVP trends, and event performance in real-time charts.",             color: "#ffecd2,#fcb69f" },
  { icon: "🔔", title: "Real-time Notifications",   desc: "Get instant Socket.io notifications for every RSVP, check-in, and update.",               color: "#e8d5ff,#c9b8f5" },
  { icon: "📅", title: "Calendar Integration",      desc: "Export events to Google Calendar or download .ICS files for any calendar app.",            color: "#c8f0ff,#b3d9ff" },
  { icon: "🔒", title: "Secure Authentication",     desc: "JWT-based auth with role management (Admin, Organizer, Guest) and Google login.",          color: "#a8edea,#fed6e3" },
  { icon: "📤", title: "Export & Reports",          desc: "Download guest lists and reports as CSV, Excel, or PDF with one click.",                   color: "#ffecd2,#fcb69f" },
];

const Features = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1a1035", marginBottom: 14 }}>
          Everything you need to run <span style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>perfect events</span>
        </h1>
        <p style={{ color: "#5a4a7a", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
          From creation to check-in, RSVP Manager handles every step of your event lifecycle.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
        {featuresList.map((f, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg,${f.color})`,
            borderRadius: 18, padding: "28px 24px",
            boxShadow: "0 4px 20px rgba(108,63,197,0.10)",
            transition: "transform .2s, box-shadow .2s",
            cursor: "default"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,63,197,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,63,197,0.10)"; }}
          >
            <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1035", marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "#3d2060", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 60 }}>
        <button
          onClick={() => navigate("/signup")}
          style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", color: "#fff", border: "none", padding: "14px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 18px rgba(108,63,197,0.28)" }}
        >
          Get Started Free →
        </button>
      </div>
    </div>
  );
};

export default Features;
