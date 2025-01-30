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
import Eventname from "./components/Eventname";
import Eventdetails from "./components/Eventdetails";
import Eventlocation from "./components/Eventlocation";
import Eventurl from "./components/Eventurl";
import EventConfirmation from "./components/EventConfirmation";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/features" element={<Features />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/support" element={<Support />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/eventname" element={<Eventname />} />
        <Route path="/eventdetails" element={<Eventdetails />} />
        <Route path="/eventlocation" element={<Eventlocation />} />
        <Route path="/eventurl" element={<Eventurl />} />
        <Route path="/eventconfirmation" element={<EventConfirmation />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;