import React, { useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { ThemeContext } from "../context/ThemeContext";
import "./UserProfile.css";
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiCalendar, FiSettings, FiShield, FiArrowLeft } from "react-icons/fi";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user: authUser, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    profile: { firstName: "", lastName: "", bio: "", phone: "", location: "", website: "" }
  });
  const [settings, setSettings] = useState({
    emailNotifications: true, smsNotifications: false,
    theme: "light", language: "en", timezone: "UTC"
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const userToken = localStorage.getItem("token");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/profile");
      setUser(response.data.user);
      setFormData({ profile: { ...response.data.user.profile } });
      setSettings({ ...response.data.user.settings });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/api/users/profile", formData);
      setUser(data.user);
      updateUser(data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/users/settings", settings);
      toast.success("Settings updated successfully");
      if (settings.theme !== (isDark ? "dark" : "light")) toggleTheme();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("avatar", file);
    try {
      const { data } = await api.post("/api/users/avatar", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(data.user);
      updateUser(data.user);
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className={`user-profile-container ${isDark ? "dark" : ""}`}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#6B7280", marginBottom: "20px", fontSize: "14px" }}
      >
        <FiArrowLeft /> Back to Dashboard
      </button>

      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=4F46E5&color=fff&size=200`}
              alt="Profile"
              className="profile-avatar"
            />
            <label className="avatar-upload-btn" title="Change avatar">
              <FiUser />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
          </div>
          <h2>{user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username}</h2>
          <p>{user?.email}</p>
          <span className={`user-role ${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <div className="profile-tabs">
        {[
          { id: "profile", icon: <FiUser />, label: "Profile" },
          { id: "settings", icon: <FiSettings />, label: "Settings" },
          { id: "security", icon: <FiShield />, label: "Security" }
        ].map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.profile.firstName}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, firstName: e.target.value } })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.profile.lastName}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, lastName: e.target.value } })}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label><FiMail /> Email (read-only)</label>
              <input type="email" value={user?.email} disabled />
            </div>

            <div className="form-group">
              <label><FiPhone /> Phone</label>
              <input
                type="tel"
                value={formData.profile.phone}
                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, phone: e.target.value } })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label><FiMapPin /> Location</label>
              <input
                type="text"
                value={formData.profile.location}
                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, location: e.target.value } })}
                placeholder="Enter your location"
              />
            </div>

            <div className="form-group">
              <label><FiGlobe /> Website</label>
              <input
                type="url"
                value={formData.profile.website}
                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, website: e.target.value } })}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.profile.bio}
                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, bio: e.target.value } })}
                placeholder="Tell us about yourself"
                rows="4"
                maxLength={500}
              />
              <small style={{ color: "#9ca3af" }}>{formData.profile.bio?.length || 0}/500</small>
            </div>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}

        {activeTab === "settings" && (
          <form onSubmit={handleSettingsUpdate} className="settings-form">
            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="toggle-item">
                <span>Email Notifications</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <span>SMS Notifications</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="form-group">
                <label>Theme</label>
                <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="form-group">
                <label>Language</label>
                <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              <div className="form-group">
                <label><FiCalendar /> Timezone</label>
                <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <div className="security-section">
            <h3>Change Password</h3>
            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? "Changing..." : "Change Password"}
              </button>
            </form>

            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                className="delete-account-btn"
                onClick={() => toast.error("Please contact support to delete your account")}
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
