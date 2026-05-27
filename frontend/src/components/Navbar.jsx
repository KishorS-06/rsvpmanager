import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/LOGO.png";
import "./Navbar.css";
import useAuthStore from "../store/authStore";
import { NotificationContext } from "../context/NotificationContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  FiHome, FiZap, FiDollarSign, FiHeadphones, FiBookOpen,
  FiLogOut, FiUser, FiSettings, FiCalendar, FiBell, FiSun, FiMoon
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useContext(NotificationContext) || {};
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="RSVP Manager" />
      </div>

      {/* Center nav links */}
      <nav className="nav-links">
        <Link to="/features"><FiZap size={13} style={{ marginRight: 4 }} />Features</Link>
        <Link to="/pricing"><FiDollarSign size={13} style={{ marginRight: 4 }} />Pricing</Link>
        <Link to="/support"><FiHeadphones size={13} style={{ marginRight: 4 }} />Support</Link>
        <Link to="/blog"><FiBookOpen size={13} style={{ marginRight: 4 }} />Blog</Link>
        {isAuthenticated && (
          <Link to="/dashboard"><FiCalendar size={13} style={{ marginRight: 4 }} />Dashboard</Link>
        )}
      </nav>

      {/* Right section */}
      <div className="nav-right">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nav-bell"
          title={isDark ? "Light mode" : "Dark mode"}
          style={{ fontSize: 18 }}
        >
          {isDark ? <FiSun /> : <FiMoon />}
        </button>

        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button className="nav-bell" onClick={() => { setShowNotif(v => !v); setShowUser(false); }}>
                <FiBell />
                {(unreadCount || 0) > 0 && (
                  <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {(unreadCount || 0) > 0 && (
                      <button onClick={markAllAsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {(notifications || []).length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      (notifications || []).slice(0, 8).map(n => (
                        <div
                          key={n._id}
                          className={`notif-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => { markAsRead(n._id); setShowNotif(false); }}
                        >
                          <p>{n.title}</p>
                          <small>{n.message}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User pill */}
            <div ref={userRef} style={{ position: "relative" }}>
              <div className="nav-user-pill" onClick={() => { setShowUser(v => !v); setShowNotif(false); }}>
                <img
                  src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=6C3FC5&color=fff`}
                  alt={user?.username}
                />
                <span>{user?.profile?.firstName || user?.username}</span>
              </div>

              {showUser && (
                <div className="user-dropdown">
                  <div style={{ padding: "12px 18px 8px", borderBottom: "1px solid #f0eaff" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#4b0082" }}>
                      {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : user?.username}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{user?.email}</div>
                    <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", background: "#f0eaff", color: "#6C3FC5", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {user?.role}
                    </span>
                  </div>
                  <button className="user-dropdown-item" onClick={() => { navigate("/dashboard"); setShowUser(false); }}>
                    <FiCalendar size={15} /> Dashboard
                  </button>
                  <button className="user-dropdown-item" onClick={() => { navigate("/profile"); setShowUser(false); }}>
                    <FiUser size={15} /> My Profile
                  </button>
                  <button className="user-dropdown-item" onClick={() => { navigate("/eventname"); setShowUser(false); }}>
                    <FiZap size={15} /> Create Event
                  </button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item danger" onClick={handleLogout}>
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#4b0082", borderRadius: 8, transition: "background .18s" }}
              onMouseEnter={e => e.target.style.background = "rgba(108,63,197,0.09)"}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >
              Login
            </Link>
            <button className="demo-btn" onClick={() => navigate("/support")}>Book a Demo</button>
            <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up Free</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
