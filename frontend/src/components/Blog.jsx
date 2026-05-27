import React from "react";
import { useNavigate } from "react-router-dom";

const posts = [
  { emoji: "🎉", title: "10 Tips for Planning the Perfect Wedding Reception", date: "May 20, 2026", tag: "Wedding", color: "linear-gradient(135deg,#ffecd2,#fcb69f)", desc: "From seating charts to RSVP management, here's everything you need to know to make your big day flawless." },
  { emoji: "🏢", title: "How to Run a Corporate Event That People Actually Enjoy", date: "May 15, 2026", tag: "Corporate", color: "linear-gradient(135deg,#e8d5ff,#c9b8f5)", desc: "Engagement strategies, check-in systems, and real-time analytics that make corporate events memorable." },
  { emoji: "📊", title: "Using Analytics to Improve Your Next Event", date: "May 10, 2026", tag: "Analytics", color: "linear-gradient(135deg,#c8f0ff,#b3d9ff)", desc: "Dive into RSVP conversion rates, attendance tracking, and how data can shape better event experiences." },
  { emoji: "✉️", title: "The Art of the Perfect Event Invitation Email", date: "May 5, 2026", tag: "Email", color: "linear-gradient(135deg,#a8edea,#fed6e3)", desc: "Subject lines, timing, personalization — everything that gets your invitations opened and RSVPs confirmed." },
  { emoji: "📱", title: "QR Code Check-in: The Future of Event Entry", date: "Apr 28, 2026", tag: "Technology", color: "linear-gradient(135deg,#ffecd2,#fcb69f)", desc: "How QR-based check-in eliminates queues, prevents duplicates, and gives you real-time attendance data." },
  { emoji: "🎪", title: "Festival Planning: Managing 1000+ Guests with Ease", date: "Apr 20, 2026", tag: "Festival", color: "linear-gradient(135deg,#e8d5ff,#c9b8f5)", desc: "Capacity management, waitlists, and bulk invitations — scaling your event management to any size." },
];

const Blog = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1035", marginBottom: 12 }}>
          Event Planning <span style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Insights</span>
        </h1>
        <p style={{ color: "#5a4a7a", fontSize: 16 }}>Tips, guides, and best practices from the RSVP Manager team.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
        {posts.map((p, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(108,63,197,0.10)", borderRadius: 18,
            overflow: "hidden", boxShadow: "0 4px 20px rgba(108,63,197,0.08)",
            transition: "transform .2s, box-shadow .2s", cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,63,197,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,63,197,0.08)"; }}
          >
            <div style={{ background: p.color, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
              {p.emoji}
            </div>
            <div style={{ padding: "20px 22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ background: "linear-gradient(135deg,#e8d5ff,#c9b8f5)", color: "#6C3FC5", padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{p.tag}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{p.date}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1035", marginBottom: 10, lineHeight: 1.4 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "#5a4a7a", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              <button style={{ marginTop: 16, background: "none", border: "none", color: "#6C3FC5", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}>
                Read more →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
