import React from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    color: "linear-gradient(135deg,#e8d5ff,#c9b8f5)",
    textColor: "#4b0082",
    features: ["Up to 3 events/month", "50 guests per event", "Email invitations", "QR check-in", "Basic analytics"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    color: "linear-gradient(135deg,#6C3FC5,#E040FB)",
    textColor: "#fff",
    features: ["Unlimited events", "500 guests per event", "Custom email templates", "Advanced analytics", "CSV/Excel/PDF export", "Priority support"],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "₹2,999",
    period: "per month",
    color: "linear-gradient(135deg,#1a1035,#4b0082)",
    textColor: "#fff",
    features: ["Everything in Pro", "Unlimited guests", "White-label branding", "API access", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1a1035", marginBottom: 12 }}>
          Simple, transparent <span style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>pricing</span>
        </h1>
        <p style={{ color: "#5a4a7a", fontSize: 16 }}>No hidden fees. Cancel anytime.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {plans.map((p, i) => (
          <div key={i} style={{
            background: p.color,
            borderRadius: 22,
            padding: "36px 30px",
            position: "relative",
            boxShadow: p.popular ? "0 12px 48px rgba(108,63,197,0.32)" : "0 4px 20px rgba(108,63,197,0.10)",
            transform: p.popular ? "scale(1.04)" : "none",
            transition: "transform .2s",
          }}>
            {p.popular && (
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#F59E0B", color: "#fff", padding: "4px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                ⭐ Most Popular
              </div>
            )}
            <h2 style={{ color: p.textColor, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{p.name}</h2>
            <div style={{ color: p.textColor, marginBottom: 24 }}>
              <span style={{ fontSize: 40, fontWeight: 800 }}>{p.price}</span>
              <span style={{ fontSize: 14, opacity: .8, marginLeft: 6 }}>/{p.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
              {p.features.map((f, j) => (
                <li key={j} style={{ color: p.textColor, fontSize: 14, padding: "6px 0", display: "flex", alignItems: "center", gap: 8, opacity: .92 }}>
                  <span style={{ fontSize: 16 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup")}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: p.popular ? "none" : "2px solid rgba(255,255,255,0.6)",
                background: p.popular ? "rgba(255,255,255,0.2)" : "transparent",
                color: p.textColor, fontSize: 15, fontWeight: 700, cursor: "pointer",
                backdropFilter: "blur(8px)", transition: "background .2s"
              }}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
