import React from "react";
import { useNavigate } from "react-router-dom";

const testimonials = [
  { name: "Priya Sharma", role: "Wedding Planner", avatar: "PS", text: "RSVP Manager saved us 20+ hours on our last wedding. The QR check-in alone was worth it!", color: "#ffecd2,#fcb69f" },
  { name: "Rahul Mehta", role: "Corporate Events", avatar: "RM", text: "We manage 50+ corporate events a year. The analytics dashboard gives us insights we never had before.", color: "#e8d5ff,#c9b8f5" },
  { name: "Ananya Iyer", role: "Festival Organizer", avatar: "AI", text: "Managing 2000 guests used to be a nightmare. Now it's just a few clicks. Absolutely love it.", color: "#c8f0ff,#b3d9ff" },
];

const Sales = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1a1035", marginBottom: 14 }}>
          Trusted by <span style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>thousands</span> of event organizers
        </h1>
        <p style={{ color: "#5a4a7a", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
          From intimate weddings to large-scale festivals — RSVP Manager scales with you.
        </p>
      </div>

      {/* Testimonials */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, marginBottom: 60 }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg,${t.color})`,
            borderRadius: 20, padding: "28px 24px",
            boxShadow: "0 4px 20px rgba(108,63,197,0.10)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#6C3FC5,#E040FB)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1035" }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#5a4a7a" }}>{t.role}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#3d2060", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{t.text}"</p>
            <div style={{ marginTop: 14, color: "#F59E0B", fontSize: 18 }}>★★★★★</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: "linear-gradient(135deg,#6C3FC5,#E040FB)",
        borderRadius: 24, padding: "50px 40px", textAlign: "center",
        boxShadow: "0 12px 48px rgba(108,63,197,0.32)"
      }}>
        <h2 style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, marginBottom: 14 }}>
          Ready to transform your events?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, marginBottom: 30 }}>
          Start free today. No credit card required.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/signup")}
            style={{ background: "#fff", color: "#6C3FC5", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Start for Free →
          </button>
          <button
            onClick={() => navigate("/support")}
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.5)", padding: "13px 30px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}
          >
            Talk to Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;
