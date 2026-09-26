import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "../App.css";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userBookings, setUserBookings] = useState([]);

  // Load logged-in client data
  useEffect(() => {
    let loggedInUser = null;

    try {
      loggedInUser =
        JSON.parse(
          localStorage.getItem("advocaOneLoggedInUser") || "null"
        ) || null;
    } catch {
      loggedInUser = null;
    }

    const loggedInEmail =
      loggedInUser?.email?.trim().toLowerCase() || "";

    // Load client-specific profile
    let profile = null;

    try {
      const allProfiles =
        JSON.parse(
          localStorage.getItem("advocaOneUserProfiles") || "{}"
        ) || {};

      profile = allProfiles[loggedInEmail] || null;
    } catch {
      profile = null;
    }

    // Fallback to logged-in account
    const currentName =
      profile?.name ||
      loggedInUser?.name ||
      location.state?.name ||
      "User";

    const currentEmail =
      profile?.email ||
      loggedInUser?.email ||
      location.state?.email ||
      "";

    const currentPhone =
      profile?.phone ||
      loggedInUser?.phone ||
      "";

    setUserName(currentName);
    setUserEmail(currentEmail);
    setUserPhone(currentPhone);

    // Load all bookings
    let bookings = [];

    try {
      bookings =
        JSON.parse(
          localStorage.getItem("advocaOneBookings") || "[]"
        ) || [];
    } catch {
      bookings = [];
    }

    // Show only this client's bookings
    const currentUserBookings = bookings.filter(
      (booking) => {
        const bookingEmail =
          booking.userEmail?.trim().toLowerCase() || "";

        return (
          loggedInEmail &&
          bookingEmail === loggedInEmail
        );
      }
    );

    setUserBookings(currentUserBookings);
  }, [location.state]);

  // Total consultations
  const totalConsultations = userBookings.length;

  // Upcoming confirmed consultations
  const upcomingConsultations =
    userBookings.filter((booking) => {
      if (
        booking.status !== "Confirmed" ||
        !booking.date
      ) {
        return false;
      }

      const appointmentDate = new Date(
        `${booking.date}T00:00:00`
      );

      if (booking.time) {
        const [time, modifier] =
          booking.time.split(" ");

        let [hours, minutes] = time
          .split(":")
          .map(Number);

        if (
          modifier === "PM" &&
          hours !== 12
        ) {
          hours += 12;
        }

        if (
          modifier === "AM" &&
          hours === 12
        ) {
          hours = 0;
        }

        appointmentDate.setHours(
          hours,
          minutes,
          0,
          0
        );
      }

      return appointmentDate > new Date();
    }).length;

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("advocaOneLoggedInUser");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <button
            className="btn btn-outline-light"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </nav>

      <div className="container py-5">

        {/* Welcome */}
        <div className="dashboard-welcome mb-5">

          <div>

            <p className="text-primary fw-semibold mb-2">
              Welcome back 👋
            </p>

            <h1 className="fw-bold">
              Welcome, {userName} 👋
            </h1>

            <p className="text-muted">
              Manage your consultations, find lawyers,
              and access your profile.
            </p>

          </div>

          <div className="dashboard-balance-icon">
            ⚖️
          </div>

        </div>

        {/* Statistics */}
        <div className="row g-4 mb-4">

          {/* Upcoming */}
          <div className="col-md-4">
            <div className="dashboard-stat-card">

              <div className="stat-icon">
                📅
              </div>

              <div>
                <h6>
                  Upcoming Consultations
                </h6>

                <h2>
                  {upcomingConsultations}
                </h2>
              </div>

            </div>
          </div>

          {/* Saved Lawyers */}
          <div className="col-md-4">
            <div className="dashboard-stat-card">

              <div className="stat-icon">
                ⚖️
              </div>

              <div>
                <h6>Saved Lawyers</h6>

                <h2>0</h2>
              </div>

            </div>
          </div>

          {/* Total */}
          <div className="col-md-4">
            <div className="dashboard-stat-card">

              <div className="stat-icon">
                📋
              </div>

              <div>
                <h6>Total Consultations</h6>

                <h2>
                  {totalConsultations}
                </h2>
              </div>

            </div>
          </div>

        </div>

        {/* Main Actions */}
        <div className="row g-4">

          {/* Find Lawyers */}
          <div className="col-md-4">

            <div className="card shadow-sm h-100 p-4 text-center">

              <h3>🔍</h3>

              <h5>Find Lawyers</h5>

              <p className="text-muted">
                Search for lawyers based on practice
                area and location.
              </p>

              <Link
                to="/"
                className="btn btn-primary"
              >
                🔍 Find a Lawyer
              </Link>

            </div>

          </div>

          {/* Consultations */}
          <div className="col-md-4">

            <div className="card shadow-sm h-100 p-4 text-center">

              <h3>📅</h3>

              <h5>My Consultations</h5>

              <p className="text-muted">
                View your upcoming legal consultations.
              </p>

              <Link
                to="/my-bookings"
                className="btn btn-outline-primary"
              >
                View Consultations
              </Link>

            </div>

          </div>

          {/* Profile */}
          <div className="col-md-4">

            <div className="card shadow-sm h-100 p-4 text-center">

              <h3>👤</h3>

              <h5>My Profile</h5>

              <p className="text-muted">
                Manage your account information.
              </p>

              <Link
                to="/profile"
                className="btn btn-outline-primary"
              >
                My Profile
              </Link>

            </div>

          </div>

        </div>

        {/* Back Home */}
        <div className="text-center mt-5">

          <Link
            to="/"
            className="btn btn-outline-secondary"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;