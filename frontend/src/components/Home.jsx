import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import automate from "../assets/automate.png";
import brand from "../assets/brand.webp";
import brand1 from "../assets/brand1.webp";
import brand2 from "../assets/brand2.webp";
import Home1 from "../assets/home1.webp";
import useAuthStore from "../store/authStore";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* ── Hero ── */}
      <main className="hero-section">
        <div className="hero-text">
          <h1>Create any <span>event</span> in minutes.</h1>
          <p>Automate event management, from invite to check-in. The all-in-one RSVP platform for every occasion.</p>
          <div className="hero-btns">
            <button className="cta-btn" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}>
              Get started for free →
            </button>
            <button className="cta-btn-outline" onClick={() => navigate("/features")}>
              See Features
            </button>
          </div>
        </div>
        <div className="hero-images">
          <img
            src="https://images-cdn.easyweddings.com.au/s3/prod-ew-image-global-v2/Live/ImageUploader/festival-function-centre-supplierprofilelive-photo-6967684e-83af-428e-8110-bee9274a66e3.jpg?quality=80&format=jpg&mode=crop&autorotate=true&crop=20"
            alt="Event Hall" className="hero-img1"
          />
          <img
            src="https://cdn.larrywalshe.com/wp-content/uploads/2022/11/17132236/larry_walshe_studios_extravagent_birthday_party_austin_powers_groovy_baby_fun_playful_theme_flowers_london_8.jpg"
            alt="Dinner Party" className="hero-img2"
          />
          <img
            src="https://www.shaadidukaan.com/vogue/wp-content/uploads/2020/03/resort-in-jodhpur.jpg"
            alt="Decorations" className="hero-img3"
          />
        </div>
      </main>

      {/* ── Stats bar ── */}
      <div className="stats-bar">
        {[
          { num: "50K+", lbl: "Events Created" },
          { num: "2M+",  lbl: "RSVPs Managed" },
          { num: "98%",  lbl: "Satisfaction Rate" },
          { num: "150+", lbl: "Countries" },
        ].map(s => (
          <div className="stat-item" key={s.lbl}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Automate banner ── */}
      <div style={{ padding: "0 40px" }}>
        <img src={automate} className="autom" alt="Automate" />
      </div>

      {/* ── 3 pillars ── */}
      <div className="containers">
        <div className="container1">
          <h3>✨ Customise</h3>
          <p className="p1">Take complete control of invites, registration, check-in, and more. Tailor to your brand or style.</p>
        </div>
        <div className="container2">
          <h3>🎯 Control</h3>
          <p className="p2">Create a custom event registration experience with multi-part events, custom tags, questions, and more.</p>
        </div>
        <div className="container3">
          <h3>⚡ Automate</h3>
          <p className="p3">Streamline event planning and guest communications. Track and report in real-time. Scale your events.</p>
        </div>
      </div>

      {/* ── Content sections ── */}
      <div className="contents">
        <div className="content1">
          <h2>Event management with ease. From registration to showtime.</h2>
          <p>Start from a ready-made template, and customize your event website and registration or online RSVP experience from end-to-end. Track event invitees from invitation to registration to check-in.</p>
          <button className="cta-btn" style={{ marginTop: 20 }} onClick={() => navigate(isAuthenticated ? "/eventname" : "/signup")}>
            Create Your First Event →
          </button>
        </div>
        <img src={brand} className="pic" alt="Event management" />
      </div>

      <div className="contents">
        <img src={brand1} className="pic" alt="Registration forms" />
        <div className="content11">
          <h2>Create brilliantly customizable event registration forms.</h2>
          <p>From themes to layout, custom questions to secondary events, online invitations — RSVPify gives you complete control over your entire event registration and online RSVP form.</p>
        </div>
      </div>

      <div className="contents">
        <div className="content1">
          <h2>Go live in minutes with bespoke event website templates.</h2>
          <p>RSVPify's turnkey platform takes the guesswork out of event planning and guest list management. Impress guests with an on-brand, highly-customizable RSVP website.</p>
        </div>
        <img src={brand2} className="pic" alt="Event templates" />
      </div>

      {/* ── Feature cards ── */}
      <h2 className="title" style={{ textAlign: "center", padding: "20px 0 0", color: "#1a1035" }}>
        The tools and features you need to plan any event
      </h2>
      <div className="feature-container">
        {[
          { icon: "✉️", label: "Email Invitations",        cls: "peach"  },
          { icon: "✔️", label: "Online RSVP",              cls: "peach"  },
          { icon: "➕", label: "Custom Data Collection",   cls: "peach"  },
          { icon: "📋", label: "Guest List Management",    cls: "purple" },
          { icon: "📑", label: "Menu Preferences",         cls: "purple" },
          { icon: "💻", label: "Sub-event Management",     cls: "purple" },
          { icon: "🔒", label: "Event Privacy",            cls: "blue"   },
          { icon: "📍", label: "QR Check-in",              cls: "blue"   },
          { icon: "📊", label: "Analytics Dashboard",      cls: "blue"   },
        ].map(f => (
          <button key={f.label} className={`feature-card ${f.cls}`}>
            <span className="icon">{f.icon}</span>
            <p>{f.label}</p>
          </button>
        ))}
      </div>

      {/* ── User reviews ── */}
      <section className="user-reviews">
        <h2 className="section-title">Responsive & Retina Ready</h2>
        <div className="content-container">
          <div className="image-container">
            <img src={Home1} alt="Mobile Preview" className="mobile-img" />
          </div>
          <div className="text-container">
            <p className="subheading">Works on every device</p>
            <h2 className="title">Sleek event websites and RSVP. On any device.</h2>
            <div className="feature-grid">
              <div className="feature">
                <div className="icon" style={{ background: "linear-gradient(135deg,#e8d5ff,#c9b8f5)", padding: 14, borderRadius: "50%", fontSize: 22 }}>💻</div>
                <h3>Responsive layout</h3>
                <p>Our event website templates are fully responsive. Your site will look perfect on any device.</p>
              </div>
              <div className="feature">
                <div className="icon" style={{ background: "linear-gradient(135deg,#c8f0ff,#b3d9ff)", padding: 14, borderRadius: "50%", fontSize: 22 }}>📱</div>
                <h3>Preview on mobile</h3>
                <p>Preview your event website and emails on desktop and mobile, all within RSVP Manager.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA footer ── */}
      <div style={{ textAlign: "center", padding: "60px 20px 80px", background: "linear-gradient(135deg,rgba(108,63,197,0.08),rgba(224,64,251,0.06))" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#1a1035", marginBottom: 14 }}>
          Ready to create your next event?
        </h2>
        <p style={{ color: "#5a4a7a", marginBottom: 28, fontSize: 16 }}>
          Join thousands of event organizers who trust RSVP Manager.
        </p>
        <button className="cta-btn" style={{ fontSize: 16, padding: "14px 36px" }}
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}>
          {isAuthenticated ? "Go to Dashboard →" : "Start for Free →"}
        </button>
      </div>
    </div>
  );
};

export default Home;
