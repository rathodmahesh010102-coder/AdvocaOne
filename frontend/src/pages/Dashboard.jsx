import { Link, useLocation } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const location = useLocation();
const userName = location.state?.name || "User";

  return (
    <div className="dashboard-page">
        <nav className="navbar navbar-dark bg-dark">
  <div className="container">
    <Link to="/" className="navbar-brand fw-bold">
      ⚖️ AdvocaOne
    </Link>

    <Link to="/" className="btn btn-outline-light">
      Logout
    </Link>
  </div>
</nav>

      <div className="container py-5">

        <div className="dashboard-welcome mb-5">
  <div>
    <p className="text-primary fw-semibold mb-2">
      Welcome back 👋
    </p>

    <h1 className="fw-bold">
  Welcome, {userName} 👋
</h1>

<p className="text-muted">
  Manage your consultations, find lawyers, and access your profile.
</p>

    
  </div>

  <div className="dashboard-balance-icon">
    ⚖️
  </div>
</div>

<div className="row g-4 mb-4">

  <div className="col-md-4">
    <div className="dashboard-stat-card">
      <div className="stat-icon">📅</div>
      <div>
        <h6>Upcoming Consultations</h6>
        <h2>2</h2>
      </div>
    </div>
  </div>

  <div className="col-md-4">
    <div className="dashboard-stat-card">
      <div className="stat-icon">⚖️</div>
      <div>
        <h6>Saved Lawyers</h6>
        <h2>5</h2>
      </div>
    </div>
  </div>

  <div className="col-md-4">
    <div className="dashboard-stat-card">
      <div className="stat-icon">📋</div>
      <div>
        <h6>Total Consultations</h6>
        <h2>8</h2>
      </div>
    </div>
  </div>

</div>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card shadow-sm h-100 p-4 text-center">
              <h3>🔍</h3>
              <h5>Find Lawyers</h5>
              <p className="text-muted">
                Search for lawyers based on practice area and location.
              </p>

              <Link to="/" className="btn btn-primary">
  🔍 Find a Lawyer
</Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100 p-4 text-center">
              <h3>📅</h3>
              <h5>My Consultations</h5>
              <p className="text-muted">
                View your upcoming legal consultations.
              </p>

              <Link to="/my-bookings" className="btn btn-outline-primary">
  View Consultations
</Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100 p-4 text-center">
              <h3>👤</h3>
              <h5>My Profile</h5>
              <p className="text-muted">
                Manage your account information.
              </p>

              <Link to="/profile" className="btn btn-outline-primary">
  My Profile
</Link>
            </div>
          </div>

        </div>

        <div className="text-center mt-5">
          <Link to="/" className="btn btn-outline-secondary">
            ← Back to Home
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;