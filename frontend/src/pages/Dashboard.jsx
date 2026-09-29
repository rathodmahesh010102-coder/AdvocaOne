import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../App.css";

const BOOKINGS_KEY = "advocaOneBookings";
const USERS_KEY = "advocaOneUsers";
const PROFILES_KEY = "advocaOneUserProfiles";
const LOGGED_IN_USER_KEY = "advocaOneLoggedInUser";

// ======================================================
// SAFE JSON
// ======================================================

const getSafeJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

// ======================================================
// NORMALIZE EMAIL
// ======================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

// ======================================================
// GET LOGGED-IN USER
// ======================================================

const getLoggedInUser = () => {
  return getSafeJSON(LOGGED_IN_USER_KEY, null);
};

// ======================================================
// CLIENT NOTIFICATION KEY
// ======================================================

const getClientNotificationsKey = (email) => {
  return `advocaOneNotifications_${normalizeEmail(email)}`;
};

// ======================================================
// FORMAT NOTIFICATION DATE
// ======================================================

const formatNotificationDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ======================================================
// GET BOOKING CLIENT EMAIL
// ======================================================

const getBookingClientEmail = (booking) => {
  return normalizeEmail(
    booking?.clientEmail ||
      booking?.userEmail ||
      booking?.email ||
      ""
  );
};

// ======================================================
// GET BOOKING STATUS
// ======================================================

const getBookingStatus = (booking) => {
  return String(booking?.status || "Pending")
    .trim()
    .toLowerCase();
};

// ======================================================
// GET BOOKING DATE
// ======================================================

const getBookingDate = (booking) => {
  return (
    booking?.date ||
    booking?.appointmentDate ||
    booking?.bookingDate ||
    ""
  );
};

// ======================================================
// CHECK UPCOMING CONFIRMED APPOINTMENT
// ======================================================

const isUpcomingConfirmed = (booking) => {
  const status = getBookingStatus(booking);

  if (status !== "confirmed") {
    return false;
  }

  const dateValue = getBookingDate(booking);

  if (!dateValue) {
    return false;
  }

  const appointmentDate = new Date(dateValue);

  if (Number.isNaN(appointmentDate.getTime())) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);

  return appointmentDate >= today;
};

// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const [userBookings, setUserBookings] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  // ====================================================
  // LOAD CLIENT INFORMATION
  // ====================================================

  useEffect(() => {
    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const email = normalizeEmail(loggedInUser.email);

    setUserName(
      loggedInUser.name ||
        loggedInUser.userName ||
        "User"
    );

    setUserEmail(email);

    setUserPhone(
      loggedInUser.phone ||
        loggedInUser.mobile ||
        ""
    );

    // --------------------------------------------------
    // LOAD PROFILE
    // --------------------------------------------------

    const profiles = getSafeJSON(
      PROFILES_KEY,
      {}
    );

    let profile = null;

    if (Array.isArray(profiles)) {
      profile =
        profiles.find(
          (item) =>
            normalizeEmail(item?.email) === email
        ) || null;
    } else if (
      profiles &&
      typeof profiles === "object"
    ) {
      profile =
        profiles[email] ||
        profiles[loggedInUser.email] ||
        null;
    }

    if (profile) {
      setUserName(
        profile.name ||
          profile.fullName ||
          loggedInUser.name ||
          "User"
      );

      setUserPhone(
        profile.phone ||
          profile.mobile ||
          loggedInUser.phone ||
          ""
      );
    }

    // --------------------------------------------------
    // LOAD USER RECORD
    // --------------------------------------------------

    const users = getSafeJSON(
      USERS_KEY,
      []
    );

    if (Array.isArray(users)) {
      const matchingUser = users.find(
        (item) =>
          normalizeEmail(item?.email) === email
      );

      if (matchingUser) {
        setUserName(
          matchingUser.name ||
            matchingUser.userName ||
            profile?.name ||
            "User"
        );

        setUserPhone(
          matchingUser.phone ||
            matchingUser.mobile ||
            profile?.phone ||
            ""
        );
      }
    }
  }, [
    navigate,
    location.pathname,
    refreshKey,
  ]);

  // ====================================================
  // LOAD BOOKINGS
  // ====================================================

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const allBookings = getSafeJSON(
      BOOKINGS_KEY,
      []
    );

    if (!Array.isArray(allBookings)) {
      setUserBookings([]);
      return;
    }

    const clientBookings = allBookings.filter(
      (booking) =>
        getBookingClientEmail(booking) ===
        userEmail
    );

    setUserBookings(clientBookings);
  }, [
    userEmail,
    refreshKey,
  ]);

  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications = () => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }

    const key =
      getClientNotificationsKey(
        userEmail
      );

    const savedNotifications =
      getSafeJSON(key, []);

    const notificationList =
      Array.isArray(savedNotifications)
        ? savedNotifications
        : [];

    const sortedNotifications = [
      ...notificationList,
    ].sort((a, b) => {
      const dateA = new Date(
        a?.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b?.createdAt || 0
      ).getTime();

      return dateB - dateA;
    });

    setNotifications(
      sortedNotifications
    );
  };

  useEffect(() => {
    loadNotifications();
  }, [
    userEmail,
    refreshKey,
  ]);

  // ====================================================
  // LISTEN FOR DATA CHANGES
  // ====================================================

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshKey(
        (value) => value + 1
      );
    };

    const handleStorage = () => {
      setRefreshKey(
        (value) => value + 1
      );
    };

    const handleFocus = () => {
      setRefreshKey(
        (value) => value + 1
      );
    };

    window.addEventListener(
      "advocaOneDataUpdated",
      handleDataUpdated
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "advocaOneDataUpdated",
        handleDataUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // ====================================================
  // UNREAD NOTIFICATIONS
  // ====================================================

  const unreadNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) =>
          !notification?.read
      ).length;
    }, [notifications]);

  // ====================================================
  // UPCOMING CONSULTATIONS
  // ====================================================

  const upcomingConsultations =
    useMemo(() => {
      return userBookings.filter(
        isUpcomingConfirmed
      ).length;
    }, [userBookings]);

  // ====================================================
  // TOTAL CONSULTATIONS
  // ====================================================

  const totalConsultations =
    useMemo(() => {
      return userBookings.length;
    }, [userBookings]);

  // ====================================================
  // MARK ONE NOTIFICATION AS READ
  // ====================================================

  const markNotificationRead = (
    notification
  ) => {
    if (!notification || !userEmail) {
      return;
    }

    const key =
      getClientNotificationsKey(
        userEmail
      );

    const currentNotifications =
      getSafeJSON(key, []);

    if (
      !Array.isArray(
        currentNotifications
      )
    ) {
      return;
    }

    const updatedNotifications =
      currentNotifications.map(
        (item) => {
          if (
            item?.id ===
            notification?.id
          ) {
            return {
              ...item,
              read: true,
            };
          }

          return item;
        }
      );

    localStorage.setItem(
      key,
      JSON.stringify(
        updatedNotifications
      )
    );

    setNotifications(
      [...updatedNotifications].sort(
        (a, b) =>
          new Date(
            b?.createdAt || 0
          ).getTime() -
          new Date(
            a?.createdAt || 0
          ).getTime()
      )
    );

    if (
      notification?.type ===
        "appointment" ||
      notification?.appointmentId
    ) {
      navigate("/my-bookings");
    }
  };

  // ====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ====================================================

  const markAllNotificationsRead =
    () => {
      if (!userEmail) {
        return;
      }

      const key =
        getClientNotificationsKey(
          userEmail
        );

      const currentNotifications =
        getSafeJSON(key, []);

      if (
        !Array.isArray(
          currentNotifications
        )
      ) {
        return;
      }

      const updatedNotifications =
        currentNotifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        );

      localStorage.setItem(
        key,
        JSON.stringify(
          updatedNotifications
        )
      );

      setNotifications(
        updatedNotifications
      );

      window.dispatchEvent(
        new CustomEvent(
          "advocaOneDataUpdated"
        )
      );
    };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      LOGGED_IN_USER_KEY
    );

    localStorage.removeItem(
      "token"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="app-header">

        <div className="header-container">

          <Link
            to="/"
            className="logo"
          >
            ⚖️ AdvocaOne
          </Link>

          <nav className="header-nav">

            <Link to="/">
              Home
            </Link>

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/my-bookings">
              My Consultations
            </Link>

            <Link to="/profile">
              My Profile
            </Link>

            {/* ==========================================
                NOTIFICATION BELL
            ========================================== */}

            <div className="notification-wrapper">

              <button
                className="notification-button"
                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-label="Notifications"
              >
                🔔

                {unreadNotifications >
                  0 && (
                  <span className="notification-count">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown">

                  <div className="notification-dropdown-header">

                    <div>
                      <strong>
                        Notifications
                      </strong>

                      <span>
                        {
                          unreadNotifications
                        }{" "}
                        unread
                      </span>
                    </div>

                    {unreadNotifications >
                      0 && (
                      <button
                        className="notification-mark-all"
                        onClick={
                          markAllNotificationsRead
                        }
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  <div className="notification-list">

                    {notifications.length ===
                    0 ? (
                      <div className="notification-empty">

                        <span>
                          🔔
                        </span>

                        <p>
                          No notifications
                        </p>

                      </div>
                    ) : (
                      notifications
                        .slice(0, 10)
                        .map(
                          (
                            notification
                          ) => (
                            <button
                              key={
                                notification.id
                              }
                              className={`notification-item ${
                                notification.read
                                  ? ""
                                  : "unread"
                              }`}
                              onClick={() =>
                                markNotificationRead(
                                  notification
                                )
                              }
                            >

                              <span className="notification-item-icon">
                                {notification.type ===
                                "appointment"
                                  ? "📅"
                                  : "🔔"}
                              </span>

                              <span className="notification-item-content">

                                <strong>
                                  {notification.title ||
                                    "Notification"}
                                </strong>

                                <span>
                                  {notification.message ||
                                    "You have a new notification."}
                                </span>

                                <small>
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </small>

                              </span>

                            </button>
                          )
                        )
                    )}

                  </div>

                </div>
              )}

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </nav>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-container">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-eyebrow">
              CLIENT DASHBOARD
            </p>

            <h1>
              Welcome, {userName}! 👋
            </h1>

            <p>
              Manage your legal consultations,
              bookings and profile from one
              place.
            </p>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              📅
            </div>

            <div>
              <span>
                Upcoming Consultations
              </span>

              <strong>
                {upcomingConsultations}
              </strong>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              ❤️
            </div>

            <div>
              <span>
                Saved Lawyers
              </span>

              <strong>
                0
              </strong>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              📋
            </div>

            <div>
              <span>
                Total Consultations
              </span>

              <strong>
                {totalConsultations}
              </strong>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🔔
            </div>

            <div>
              <span>
                Unread Notifications
              </span>

              <strong>
                {unreadNotifications}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-eyebrow">
                QUICK ACCESS
              </p>

              <h2>
                Manage Your Legal Services
              </h2>

            </div>

          </div>

          <div className="dashboard-grid">

            {/* FIND LAWYERS */}

            <Link
              to="/"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                ⚖️
              </div>

              <div>
                <h3>
                  Find Lawyers
                </h3>

                <p>
                  Search and find lawyers
                  according to your legal
                  needs.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* MY CONSULTATIONS */}

            <Link
              to="/my-bookings"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                📅
              </div>

              <div>
                <h3>
                  My Consultations
                </h3>

                <p>
                  View your appointments,
                  booking status and
                  consultations.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* DOCUMENTS */}

            <Link
              to="/documents"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                📄
              </div>

              <div>
                <h3>
                  My Documents
                </h3>

                <p>
                  View and manage your legal
                  documents.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                👤
              </div>

              <div>
                <h3>
                  My Profile
                </h3>

                <p>
                  Update your personal
                  information and profile
                  details.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* CHAT */}

            <Link
              to="/chat"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                💬
              </div>

              <div>
                <h3>
                  Chat with Lawyer
                </h3>

                <p>
                  Communicate with your
                  lawyer through AdvocaOne
                  chat.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* VIDEO CONSULTATION */}

            <Link
              to="/video-consultation"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                🎥
              </div>

              <div>
                <h3>
                  Video Consultation
                </h3>

                <p>
                  Join your online legal
                  consultation.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* PAYMENT */}

            <Link
              to="/payment"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                💳
              </div>

              <div>
                <h3>
                  Payments
                </h3>

                <p>
                  View the consultation
                  payment page.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* AI LEGAL ASSISTANT */}

            <Link
              to="/legal-assistant"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                🤖
              </div>

              <div>
                <h3>
                  AI Legal Assistant
                </h3>

                <p>
                  Get general legal
                  information and understand
                  your legal issue.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* AI CASE SUMMARY */}

            <Link
              to="/case-summary"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                📝
              </div>

              <div>
                <h3>
                  AI Case Summary
                </h3>

                <p>
                  Summarize your legal issue
                  and organize important case
                  information.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

            {/* NOTIFICATION SETTINGS */}

            <Link
              to="/notification-settings"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                🔔
              </div>

              <div>
                <h3>
                  Notification Settings
                </h3>

                <p>
                  Manage your email, SMS,
                  appointment and chat
                  notification preferences.
                </p>
              </div>

              <span className="dashboard-card-arrow">
                →
              </span>
            </Link>

          </div>

        </section>

        {/* =================================================
            RECENT CONSULTATIONS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-eyebrow">
                ACTIVITY
              </p>

              <h2>
                Recent Consultations
              </h2>

            </div>

            <Link
              to="/my-bookings"
              className="section-link"
            >
              View All →
            </Link>

          </div>

          {userBookings.length ===
          0 ? (
            <div className="dashboard-empty-state">

              <div className="dashboard-empty-icon">
                📅
              </div>

              <h3>
                No consultations yet
              </h3>

              <p>
                Find a lawyer and book your
                first consultation.
              </p>

              <Link
                to="/"
                className="primary-button"
              >
                Find a Lawyer
              </Link>

            </div>
          ) : (
            <div className="recent-bookings-list">

              {userBookings
                .slice(-5)
                .reverse()
                .map(
                  (
                    booking,
                    index
                  ) => (
                    <div
                      className="recent-booking-card"
                      key={
                        booking?.id ||
                        `booking_${index}`
                      }
                    >

                      <div className="recent-booking-icon">
                        ⚖️
                      </div>

                      <div className="recent-booking-info">

                        <h3>
                          {booking?.lawyerName ||
                            booking?.lawyer ||
                            "Lawyer"}
                        </h3>

                        <p>
                          {booking?.practiceArea ||
                            booking?.specialization ||
                            "Legal Consultation"}
                        </p>

                        <small>
                          {getBookingDate(
                            booking
                          ) ||
                            "Date not available"}
                        </small>

                      </div>

                      <span
                        className={`booking-status status-${getBookingStatus(
                          booking
                        )}`}
                      >
                        {booking?.status ||
                          "Pending"}
                      </span>

                    </div>
                  )
                )}

            </div>
          )}

        </section>

        {/* =================================================
            PROFILE SUMMARY
        ================================================= */}

        <section className="dashboard-profile-summary">

          <div>

            <p className="dashboard-eyebrow">
              ACCOUNT
            </p>

            <h2>
              Your Profile
            </h2>

            <p>
              <strong>
                Name:
              </strong>{" "}
              {userName}
            </p>

            <p>
              <strong>
                Email:
              </strong>{" "}
              {userEmail ||
                "Not available"}
            </p>

            <p>
              <strong>
                Phone:
              </strong>{" "}
              {userPhone ||
                "Not available"}
            </p>

          </div>

          <Link
            to="/profile"
            className="primary-button"
          >
            Edit Profile
          </Link>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;

