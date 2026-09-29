import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const SETTINGS_PREFIX = "advocaOneNotificationSettings_";
const LOGGED_IN_USER_KEY = "advocaOneLoggedInUser";

const defaultSettings = {
  emailNotifications: true,
  smsNotifications: false,
  appointmentConfirmation: true,
  appointmentReminder: true,
  cancellationNotification: true,
  chatNotification: true,
  paymentNotification: true,
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getLoggedInUser() {
  try {
    const user = JSON.parse(
      localStorage.getItem(LOGGED_IN_USER_KEY) || "null"
    );

    return user || null;
  } catch {
    return null;
  }
}

function getSettingsKey(email) {
  return `${SETTINGS_PREFIX}${normalizeEmail(email)}`;
}

function getSavedSettings(email) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(getSettingsKey(email)) || "null"
    );

    return {
      ...defaultSettings,
      ...(saved || {}),
    };
  } catch {
    return defaultSettings;
  }
}

function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
      return;
    }

    setUser(loggedInUser);

    const savedSettings = getSavedSettings(loggedInUser.email);

    setSettings(savedSettings);
  }, []);

  const handleToggle = (settingName) => {
    setSettings((previous) => ({
      ...previous,
      [settingName]: !previous[settingName],
    }));

    setSavedMessage("");
  };

  const saveSettings = () => {
    if (!user?.email) {
      return;
    }

    localStorage.setItem(
      getSettingsKey(user.email),
      JSON.stringify(settings)
    );

    window.dispatchEvent(
      new CustomEvent("advocaOneDataUpdated")
    );

    setSavedMessage("Notification settings saved successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  return (
    <div className="notification-settings-page">
      <div className="notification-settings-container">

        {/* Header */}
        <div className="notification-settings-header">
          <div>
            <h1>🔔 Notification Settings</h1>

            <p>
              Manage how you receive notifications from AdvocaOne.
            </p>
          </div>

          <div className="notification-settings-header-actions">
            <Link to="/dashboard" className="settings-header-link">
              Dashboard
            </Link>

            <Link to="/profile" className="settings-header-link">
              My Profile
            </Link>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="settings-user-card">
            <div className="settings-user-avatar">
              {String(user.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h3>{user.name || "User"}</h3>

              <p>{user.email}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {savedMessage && (
          <div className="settings-success-message">
            ✅ {savedMessage}
          </div>
        )}

        {/* General Notifications */}
        <section className="notification-settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>📢 General Notifications</h2>

              <p>
                Choose where you want to receive notifications.
              </p>
            </div>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">📧</div>

            <div className="setting-content">
              <h3>Email Notifications</h3>

              <p>
                Receive important AdvocaOne notifications by email.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.emailNotifications ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("emailNotifications")
              }
              aria-label="Toggle email notifications"
            >
              <span></span>
            </button>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">📱</div>

            <div className="setting-content">
              <h3>SMS Notifications</h3>

              <p>
                Receive important AdvocaOne notifications by SMS.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.smsNotifications ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("smsNotifications")
              }
              aria-label="Toggle SMS notifications"
            >
              <span></span>
            </button>
          </div>
        </section>

        {/* Appointment Notifications */}
        <section className="notification-settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>📅 Appointment Notifications</h2>

              <p>
                Control notifications related to your consultations.
              </p>
            </div>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">✅</div>

            <div className="setting-content">
              <h3>Appointment Confirmation</h3>

              <p>
                Get notified when a lawyer confirms your appointment.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.appointmentConfirmation ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("appointmentConfirmation")
              }
              aria-label="Toggle appointment confirmation"
            >
              <span></span>
            </button>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">⏰</div>

            <div className="setting-content">
              <h3>Appointment Reminders</h3>

              <p>
                Receive reminders before your consultation.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.appointmentReminder ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("appointmentReminder")
              }
              aria-label="Toggle appointment reminders"
            >
              <span></span>
            </button>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">❌</div>

            <div className="setting-content">
              <h3>Cancellation Notifications</h3>

              <p>
                Get notified when an appointment is cancelled.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.cancellationNotification ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("cancellationNotification")
              }
              aria-label="Toggle cancellation notifications"
            >
              <span></span>
            </button>
          </div>
        </section>

        {/* Other Notifications */}
        <section className="notification-settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>⚙️ Other Notifications</h2>

              <p>
                Manage notifications for other AdvocaOne activities.
              </p>
            </div>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">💬</div>

            <div className="setting-content">
              <h3>Chat Notifications</h3>

              <p>
                Get notified when a lawyer sends you a chat message.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.chatNotification ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("chatNotification")
              }
              aria-label="Toggle chat notifications"
            >
              <span></span>
            </button>
          </div>

          <div className="notification-setting-row">
            <div className="setting-icon">💰</div>

            <div className="setting-content">
              <h3>Payment Notifications</h3>

              <p>
                Receive notifications related to payments.
              </p>
            </div>

            <button
              type="button"
              className={`setting-toggle ${
                settings.paymentNotification ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("paymentNotification")
              }
              aria-label="Toggle payment notifications"
            >
              <span></span>
            </button>
          </div>
        </section>

        {/* Save */}
        <div className="notification-settings-footer">
          <button
            type="button"
            className="save-settings-button"
            onClick={saveSettings}
          >
            💾 Save Notification Settings
          </button>

          <Link
            to="/dashboard"
            className="cancel-settings-button"
          >
            Cancel
          </Link>
        </div>

        {/* Information */}
        <div className="settings-info-box">
          <strong>ℹ️ Note:</strong>

          <p>
            These settings are currently stored in your browser.
            Email and SMS delivery will be connected to the backend
            notification service later.
          </p>
        </div>

      </div>
    </div>
  );
}

export default NotificationSettings;