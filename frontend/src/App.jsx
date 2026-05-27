import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Features from "./components/Features";
import Login from "./components/Login";
import Pricing from "./components/Pricing";
import Sales from "./components/Sales";
import Support from "./components/Support";
import Blog from "./components/Blog";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Eventname from "./components/Eventname";
import Eventdetails from "./components/Eventdetails";
import Eventlocation from "./components/Eventlocation";
import Eventurl from "./components/Eventurl";
import EventConfirmation from "./components/EventConfirmation";
import EventDetail from "./components/EventDetail";
import GuestManager from "./components/GuestManager";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      {/* Single Navbar on every page */}
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                       element={<Home />} />
        <Route path="/signup"                 element={<Signup />} />
        <Route path="/login"                  element={<Login />} />
        <Route path="/features"               element={<Features />} />
        <Route path="/pricing"                element={<Pricing />} />
        <Route path="/sales"                  element={<Sales />} />
        <Route path="/support"                element={<Support />} />
        <Route path="/blog"                   element={<Blog />} />
        <Route path="/forgot-password"        element={<ForgotPassword />} />
        <Route path="/reset-password/:token"  element={<ResetPassword />} />

        {/* ── Protected ── */}
        <Route path="/dashboard"              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile"                element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/eventname"              element={<ProtectedRoute><Eventname /></ProtectedRoute>} />
        <Route path="/eventdetails"           element={<ProtectedRoute><Eventdetails /></ProtectedRoute>} />
        <Route path="/eventlocation"          element={<ProtectedRoute><Eventlocation /></ProtectedRoute>} />
        <Route path="/eventurl"               element={<ProtectedRoute><Eventurl /></ProtectedRoute>} />
        <Route path="/eventconfirmation"      element={<ProtectedRoute><EventConfirmation /></ProtectedRoute>} />
        <Route path="/events/:id"             element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/events/:eventId/guests" element={<ProtectedRoute><GuestManager /></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🎪</div>
            <h1 style={{ fontSize: "4rem", fontWeight: 800, background: "linear-gradient(135deg,#6C3FC5,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 12px" }}>404</h1>
            <h2 style={{ color: "#1a1035", marginBottom: 10 }}>Page Not Found</h2>
            <p style={{ color: "#6B7280", marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ background: "linear-gradient(135deg,#6C3FC5,#E040FB)", color: "#fff", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15 }}>← Go Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
