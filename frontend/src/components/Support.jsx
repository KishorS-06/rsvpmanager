import React, { useState } from "react";
import { toast } from "react-hot-toast";

const faqs = [
  { q: "How do I create my first event?", a: "Sign up, go to Dashboard, click 'Create Event', and follow the 5-step wizard. It takes under 2 minutes." },
  { q: "Can guests RSVP without an account?", a: "Yes! Guests receive an invitation email with a direct RSVP link — no account needed." },
  { q: "How does QR check-in work?", a: "Each guest gets a unique QR code in their confirmation email. At the event, scan it from the Guest Manager page." },
  { q: "Can I export my guest list?", a: "Yes — export to CSV, Excel, or PDF from the Guest Manager page with one click." },
  { q: "Is there a guest limit?", a: "The free plan supports up to 50 guests per event. Pro and Business plans have higher limits." },
  { q: "How do email notifications work?", a: "Configure your SMTP settings in the backend .env file. Guests receive invitation, confirmation, and reminder emails automatically." },
];

const Support = () => {
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  const card = { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", border: "1px solid rgba(108,63,197,0.12)", borderRadius: 18, padding: "28px 28px", boxShadow: "0 4px 20px rgba(108,63,197,0.08)" };

  return (
    <div style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1035", marginBottom: 12 }}>
          How can we <span style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>help you?</span>
        </h1>
        <p style={{ color: "#5a4a7a", fontSize: 16 }}>Browse FAQs or send us a message.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* FAQs */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1035", marginBottom: 20 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ ...card, marginBottom: 12, padding: "16px 20px", cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1035" }}>{f.q}</span>
                <span style={{ color: "#6C3FC5", fontSize: 20, fontWeight: 700 }}>{open === i ? "−" : "+"}</span>
              </div>
              {open === i && <p style={{ margin: "12px 0 0", fontSize: 14, color: "#5a4a7a", lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={card}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1035", marginBottom: 20 }}>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            {[
              { label: "Your Name", name: "name", type: "text", placeholder: "John Doe" },
              { label: "Email Address", name: "email", type: "email", placeholder: "john@example.com" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3d2060", marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0d6f7", borderRadius: 9, fontSize: 14, background: "rgba(255,255,255,0.9)", color: "#1a1035", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3d2060", marginBottom: 6 }}>Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue or question..."
                rows={5}
                required
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0d6f7", borderRadius: 9, fontSize: 14, background: "rgba(255,255,255,0.9)", color: "#1a1035", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            <button type="submit" style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#6C3FC5,#E040FB)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(108,63,197,0.28)" }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
