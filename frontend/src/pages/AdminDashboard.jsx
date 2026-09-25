import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("lawyers");

  const defaultLawyers = [
    {
      id: 1,
      name: "Adv. Rahul Sharma",
      specialization: "Criminal Law",
      city: "Pune",
      experience: 8,
      fee: 1000,
      status: "Approved",
    },
    {
      id: 2,
      name: "Adv. Priya Patil",
      specialization: "Family Law",
      city: "Mumbai",
      experience: 6,
      fee: 800,
      status: "Approved",
    },
    {
      id: 3,
      name: "Adv. Amit Deshmukh",
      specialization: "Corporate Law",
      city: "Pune",
      experience: 10,
      fee: 1500,
      status: "Pending",
    },
    {
      id: 4,
      name: "Adv. Sneha Joshi",
      specialization: "Cyber Law",
      city: "Nashik",
      experience: 5,
      fee: 900,
      status: "Rejected",
    },
    {
      id: 5,
      name: "Adv. Vikram Singh",
      specialization: "Property Law",
      city: "Delhi",
      experience: 12,
      fee: 2000,
      status: "Approved",
    },
  ];

  const savedLawyers = JSON.parse(
    localStorage.getItem("advocaOneAdminLawyers")
  );

  const [lawyers, setLawyers] = useState(
    savedLawyers && savedLawyers.length > 0
      ? savedLawyers
      : defaultLawyers
  );

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Mahesh Rathod",
      email: "mahesh@example.com",
      role: "Client",
      status: "Active",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "Lawyer",
      status: "Active",
    },
    {
      id: 3,
      name: "Priya Patil",
      email: "priya@example.com",
      role: "Lawyer",
      status: "Active",
    },
    {
      id: 4,
      name: "Amit Kumar",
      email: "amit@example.com",
      role: "Client",
      status: "Inactive",
    },
    {
      id: 5,
      name: "Sneha Joshi",
      email: "sneha@example.com",
      role: "Client",
      status: "Active",
    },
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      client: "Mahesh Rathod",
      lawyer: "Adv. Rahul Sharma",
      date: "25 September 2026",
      time: "10:00 AM",
      type: "Online",
      status: "Confirmed",
    },
    {
      id: 2,
      client: "Sneha Joshi",
      lawyer: "Adv. Priya Patil",
      date: "25 September 2026",
      time: "2:00 PM",
      type: "In-Person",
      status: "Pending",
    },
    {
      id: 3,
      client: "Amit Kumar",
      lawyer: "Adv. Amit Deshmukh",
      date: "26 September 2026",
      time: "11:00 AM",
      type: "Online",
      status: "Completed",
    },
    {
      id: 4,
      client: "Rahul Patil",
      lawyer: "Adv. Vikram Singh",
      date: "27 September 2026",
      time: "4:00 PM",
      type: "Online",
      status: "Cancelled",
    },
  ]);

  const [selectedLawyer, setSelectedLawyer] = useState(null);

  const updateLawyerStatus = (id, status) => {
    const updatedLawyers = lawyers.map((lawyer) =>
      lawyer.id === id
        ? { ...lawyer, status }
        : lawyer
    );

    setLawyers(updatedLawyers);

    localStorage.setItem(
      "advocaOneAdminLawyers",
      JSON.stringify(updatedLawyers)
    );
  };

  const updateUserStatus = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status:
              user.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : user
    );

    setUsers(updatedUsers);
  };

  const updateAppointmentStatus = (id, status) => {
    const updatedAppointments = appointments.map(
      (appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status,
            }
          : appointment
    );

    setAppointments(updatedAppointments);
  };

  const approvedLawyers = lawyers.filter(
    (lawyer) => lawyer.status === "Approved"
  ).length;

  const pendingLawyers = lawyers.filter(
    (lawyer) => lawyer.status === "Pending"
  ).length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  return (
    <div className="admin-dashboard-page">

      <nav className="navbar navbar-dark bg-dark">
        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne Admin
          </Link>

          <Link
            to="/"
            className="btn btn-outline-light"
          >
            Logout
          </Link>

        </div>
      </nav>

      <div className="container py-5">

        <div className="mb-4">
          <h1 className="fw-bold">
            Admin Dashboard
          </h1>

          <p className="text-muted">
            Manage lawyers, users and appointments.
          </p>
        </div>

        <div className="row g-4 mb-5">

          <div className="col-md-3">
            <div className="card shadow-sm p-4 admin-stat-card">

              <h6 className="text-muted">
                Total Lawyers
              </h6>

              <h2 className="fw-bold">
                {lawyers.length}
              </h2>

              <span>
                👨‍⚖️ Registered lawyers
              </span>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 admin-stat-card">

              <h6 className="text-muted">
                Pending Verification
              </h6>

              <h2 className="fw-bold">
                {pendingLawyers}
              </h2>

              <span>
                ⏳ Need review
              </span>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 admin-stat-card">

              <h6 className="text-muted">
                Approved Lawyers
              </h6>

              <h2 className="fw-bold">
                {approvedLawyers}
              </h2>

              <span>
                ✅ Verified profiles
              </span>

            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 admin-stat-card">

              <h6 className="text-muted">
                Active Users
              </h6>

              <h2 className="fw-bold">
                {activeUsers}
              </h2>

              <span>
                👥 Active accounts
              </span>

            </div>
          </div>

        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <div className="row g-2">

              <div className="col-md-4">
                <button
                  className={
                    activeSection === "lawyers"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection("lawyers")
                  }
                >
                  👨‍⚖️ Lawyer Verification
                </button>
              </div>

              <div className="col-md-4">
                <button
                  className={
                    activeSection === "users"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection("users")
                  }
                >
                  👥 User Management
                </button>
              </div>

              <div className="col-md-4">
                <button
                  className={
                    activeSection === "appointments"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection("appointments")
                  }
                >
                  📅 Appointments
                </button>
              </div>

            </div>

          </div>
        </div>

        {activeSection === "lawyers" && (
          <div className="card shadow-sm p-4">

            <div className="mb-4">
              <h3 className="fw-bold">
                👨‍⚖️ Lawyer Verification
              </h3>

              <p className="text-muted">
                Review and manage registered lawyers.
              </p>
            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>Lawyer</th>
                    <th>Practice Area</th>
                    <th>City</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {lawyers.map((lawyer) => (
                    <tr key={lawyer.id}>

                      <td>
                        <strong>
                          {lawyer.name}
                        </strong>
                      </td>

                      <td>
                        {lawyer.specialization}
                      </td>

                      <td>
                        {lawyer.city}
                      </td>

                      <td>
                        {lawyer.experience} Years
                      </td>

                      <td>
                        ₹{lawyer.fee}
                      </td>

                      <td>
                        <span
                          className={
                            lawyer.status === "Approved"
                              ? "badge bg-success"
                              : lawyer.status === "Rejected"
                              ? "badge bg-danger"
                              : "badge bg-warning text-dark"
                          }
                        >
                          {lawyer.status}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-2 flex-wrap">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              setSelectedLawyer(lawyer)
                            }
                          >
                            👁️ View
                          </button>

                          {lawyer.status !== "Approved" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                updateLawyerStatus(
                                  lawyer.id,
                                  "Approved"
                                )
                              }
                            >
                              ✓ Approve
                            </button>
                          )}

                          {lawyer.status !== "Rejected" && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                updateLawyerStatus(
                                  lawyer.id,
                                  "Rejected"
                                )
                              }
                            >
                              ✕ Reject
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {activeSection === "users" && (
          <div className="card shadow-sm p-4">

            <div className="mb-4">

              <h3 className="fw-bold">
                👥 User Management
              </h3>

              <p className="text-muted">
                Manage client and lawyer accounts.
              </p>

            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <strong>
                          {user.name}
                        </strong>
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        <span
                          className={
                            user.role === "Lawyer"
                              ? "badge bg-primary"
                              : "badge bg-secondary"
                          }
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            user.status === "Active"
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className={
                            user.status === "Active"
                              ? "btn btn-sm btn-outline-danger"
                              : "btn btn-sm btn-outline-success"
                          }
                          onClick={() =>
                            updateUserStatus(user.id)
                          }
                        >
                          {user.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {activeSection === "appointments" && (
          <div className="card shadow-sm p-4">

            <div className="mb-4">

              <h3 className="fw-bold">
                📅 Appointment Management
              </h3>

              <p className="text-muted">
                Monitor all platform consultations.
              </p>

            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Lawyer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>

                      <td>
                        <strong>
                          {appointment.client}
                        </strong>
                      </td>

                      <td>
                        {appointment.lawyer}
                      </td>

                      <td>
                        {appointment.date}
                      </td>

                      <td>
                        {appointment.time}
                      </td>

                      <td>
                        {appointment.type}
                      </td>

                      <td>

                        <span
                          className={
                            appointment.status === "Confirmed"
                              ? "badge bg-success"
                              : appointment.status === "Completed"
                              ? "badge bg-primary"
                              : appointment.status === "Cancelled"
                              ? "badge bg-danger"
                              : "badge bg-warning text-dark"
                          }
                        >
                          {appointment.status}
                        </span>

                      </td>

                      <td>

                        {appointment.status === "Pending" && (
                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "Confirmed"
                                )
                              }
                            >
                              ✓ Confirm
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "Cancelled"
                                )
                              }
                            >
                              ✕ Cancel
                            </button>

                          </div>
                        )}

                        {appointment.status === "Confirmed" && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "Cancelled"
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}

                        {appointment.status === "Completed" && (
                          <span className="text-primary">
                            ✓ Completed
                          </span>
                        )}

                        {appointment.status === "Cancelled" && (
                          <span className="text-danger">
                            ✕ Cancelled
                          </span>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {selectedLawyer && (
          <div className="card shadow-lg p-4 mt-4">

            <div className="d-flex justify-content-between">

              <h3 className="fw-bold">
                Lawyer Details
              </h3>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSelectedLawyer(null)
                }
              >
                ✕
              </button>

            </div>

            <hr />

            <div className="row g-3">

              <div className="col-md-6">
                <strong>Lawyer Name</strong>
                <p>{selectedLawyer.name}</p>
              </div>

              <div className="col-md-6">
                <strong>Practice Area</strong>
                <p>
                  {selectedLawyer.specialization}
                </p>
              </div>

              <div className="col-md-6">
                <strong>City</strong>
                <p>{selectedLawyer.city}</p>
              </div>

              <div className="col-md-6">
                <strong>Experience</strong>
                <p>
                  {selectedLawyer.experience} Years
                </p>
              </div>

              <div className="col-md-6">
                <strong>Consultation Fee</strong>
                <p>₹{selectedLawyer.fee}</p>
              </div>

              <div className="col-md-6">
                <strong>Verification Status</strong>
                <p>{selectedLawyer.status}</p>
              </div>

              {selectedLawyer.email && (
                <div className="col-md-6">
                  <strong>Email</strong>
                  <p>{selectedLawyer.email}</p>
                </div>
              )}

              {selectedLawyer.phone && (
                <div className="col-md-6">
                  <strong>Phone</strong>
                  <p>{selectedLawyer.phone}</p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminDashboard;