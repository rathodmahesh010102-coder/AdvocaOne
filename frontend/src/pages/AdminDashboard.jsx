import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function AdminDashboard() {
  const [activeSection, setActiveSection] =
    useState("lawyers");

  const [selectedLawyer, setSelectedLawyer] =
    useState(null);

  // Default lawyers for demo
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

  const [lawyers, setLawyers] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  // ==============================
  // LOAD LAWYERS
  // ==============================

  const loadLawyers = () => {
    try {
      const savedLawyers =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAdminLawyers"
          ) || "[]"
        ) || [];

      if (
        Array.isArray(savedLawyers) &&
        savedLawyers.length > 0
      ) {
        setLawyers(savedLawyers);
      } else {
        setLawyers(defaultLawyers);

        localStorage.setItem(
          "advocaOneAdminLawyers",
          JSON.stringify(defaultLawyers)
        );
      }
    } catch (error) {
      console.error(
        "Error loading lawyers:",
        error
      );

      setLawyers(defaultLawyers);
    }
  };

  // ==============================
  // LOAD USERS
  // ==============================

  const loadUsers = () => {
    try {
      const savedAccounts =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAccounts"
          ) || "[]"
        ) || [];

      if (Array.isArray(savedAccounts)) {
        const formattedUsers =
          savedAccounts.map(
            (account, index) => ({
              id:
                account.id ||
                index + 1,

              name:
                account.name ||
                "User",

              email:
                account.email ||
                "",

              role:
                account.role ||
                "Client",

              status:
                account.status ||
                "Active",
            })
          );

        setUsers(
          formattedUsers
        );
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(
        "Error loading users:",
        error
      );

      setUsers([]);
    }
  };

  // ==============================
  // LOAD APPOINTMENTS
  // ==============================

  const loadAppointments = () => {
    try {
      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            "advocaOneBookings"
          ) || "[]"
        ) || [];

      if (!Array.isArray(savedBookings)) {
        setAppointments([]);
        return;
      }

      const formattedAppointments =
        savedBookings.map(
          (booking, index) => ({
            ...booking,

            id:
              booking.id ||
              index + 1,

            client:
              booking.client ||
              booking.userName ||
              booking.name ||
              "Client",

            lawyer:
              booking.lawyerName ||
              booking.lawyer ||
              "Lawyer",

            date:
              booking.date ||
              booking.bookingDate ||
              "",

            time:
              booking.time ||
              booking.bookingTime ||
              "",

            type:
              booking.type ||
              booking.consultationType ||
              booking.mode ||
              "Online",

            status:
              booking.status ||
              "Pending",
          })
        );

      setAppointments(
        formattedAppointments
      );
    } catch (error) {
      console.error(
        "Error loading appointments:",
        error
      );

      setAppointments([]);
    }
  };

  // ==============================
  // LOAD ALL DATA
  // ==============================

  const loadAllData = () => {
    loadLawyers();
    loadUsers();
    loadAppointments();
  };

  useEffect(() => {
    loadAllData();

    window.addEventListener(
      "storage",
      loadAllData
    );

    window.addEventListener(
      "focus",
      loadAllData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadAllData
      );

      window.removeEventListener(
        "focus",
        loadAllData
      );
    };
  }, []);

  // ==============================
  // UPDATE LAWYER STATUS
  // ==============================

  const updateLawyerStatus = (
    id,
    status
  ) => {
    const updatedLawyers =
      lawyers.map(
        (lawyer) =>
          String(lawyer.id) ===
          String(id)
            ? {
                ...lawyer,
                status,
              }
            : lawyer
      );

    setLawyers(
      updatedLawyers
    );

    localStorage.setItem(
      "advocaOneAdminLawyers",
      JSON.stringify(
        updatedLawyers
      )
    );

    // Update selected lawyer if open
    if (
      selectedLawyer &&
      String(selectedLawyer.id) ===
        String(id)
    ) {
      setSelectedLawyer({
        ...selectedLawyer,
        status,
      });
    }
  };

  // ==============================
  // UPDATE USER STATUS
  // ==============================

  const updateUserStatus = (
    id
  ) => {
    const updatedUsers =
      users.map(
        (user) =>
          String(user.id) ===
          String(id)
            ? {
                ...user,
                status:
                  user.status ===
                  "Active"
                    ? "Inactive"
                    : "Active",
              }
            : user
      );

    setUsers(
      updatedUsers
    );

    // Update account status
    try {
      const accounts =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAccounts"
          ) || "[]"
        ) || [];

      const updatedAccounts =
        accounts.map(
          (account) => {
            const matchingUser =
              updatedUsers.find(
                (user) =>
                  user.email?.toLowerCase() ===
                  account.email?.toLowerCase()
              );

            return matchingUser
              ? {
                  ...account,
                  status:
                    matchingUser.status,
                }
              : account;
          }
        );

      localStorage.setItem(
        "advocaOneAccounts",
        JSON.stringify(
          updatedAccounts
        )
      );
    } catch (error) {
      console.error(
        "Error updating account:",
        error
      );
    }
  };

  // ==============================
  // UPDATE APPOINTMENT STATUS
  // ==============================

  const updateAppointmentStatus = (
    id,
    status
  ) => {
    try {
      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            "advocaOneBookings"
          ) || "[]"
        ) || [];

      if (!Array.isArray(savedBookings)) {
        return;
      }

      const updatedBookings =
        savedBookings.map(
          (booking) =>
            String(booking.id) ===
            String(id)
              ? {
                  ...booking,
                  status,
                }
              : booking
        );

      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(
          updatedBookings
        )
      );

      // Reload from storage
      loadAppointments();
    } catch (error) {
      console.error(
        "Error updating appointment:",
        error
      );
    }
  };

  // ==============================
  // STATISTICS
  // ==============================

  const approvedLawyers =
    lawyers.filter(
      (lawyer) =>
        lawyer.status ===
        "Approved"
    ).length;

  const pendingLawyers =
    lawyers.filter(
      (lawyer) =>
        lawyer.status ===
        "Pending"
    ).length;

  const activeUsers =
    users.filter(
      (user) =>
        user.status ===
        "Active"
    ).length;

  return (
    <div className="admin-dashboard-page">

      {/* ==============================
          NAVBAR
      ============================== */}

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

        {/* ==============================
            HEADER
        ============================== */}

        <div className="mb-4">

          <h1 className="fw-bold">
            Admin Dashboard
          </h1>

          <p className="text-muted">
            Manage lawyers, users and
            appointments.
          </p>

        </div>

        {/* ==============================
            STATISTICS
        ============================== */}

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

        {/* ==============================
            SECTION TABS
        ============================== */}

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <div className="row g-2">

              <div className="col-md-4">

                <button
                  className={
                    activeSection ===
                    "lawyers"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection(
                      "lawyers"
                    )
                  }
                >
                  👨‍⚖️ Lawyer Verification
                </button>

              </div>

              <div className="col-md-4">

                <button
                  className={
                    activeSection ===
                    "users"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection(
                      "users"
                    )
                  }
                >
                  👥 User Management
                </button>

              </div>

              <div className="col-md-4">

                <button
                  className={
                    activeSection ===
                    "appointments"
                      ? "btn btn-primary w-100"
                      : "btn btn-outline-primary w-100"
                  }
                  onClick={() =>
                    setActiveSection(
                      "appointments"
                    )
                  }
                >
                  📅 Appointments
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ==============================
            LAWYERS
        ============================== */}

        {activeSection ===
          "lawyers" && (

          <div className="card shadow-sm p-4">

            <div className="mb-4">

              <h3 className="fw-bold">
                👨‍⚖️ Lawyer Verification
              </h3>

              <p className="text-muted">
                Review and manage registered
                lawyers.
              </p>

            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>

                  <tr>

                    <th>
                      Lawyer
                    </th>

                    <th>
                      Practice Area
                    </th>

                    <th>
                      City
                    </th>

                    <th>
                      Experience
                    </th>

                    <th>
                      Fee
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {lawyers.length >
                  0 ? (

                    lawyers.map(
                      (lawyer) => (

                        <tr
                          key={
                            lawyer.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                lawyer.name
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              lawyer.specialization ||
                              "Not Selected"
                            }
                          </td>

                          <td>
                            {
                              lawyer.city ||
                              "Not Selected"
                            }
                          </td>

                          <td>
                            {
                              lawyer.experience ||
                              0
                            }{" "}
                            Years
                          </td>

                          <td>
                            ₹
                            {
                              lawyer.fee ||
                              0
                            }
                          </td>

                          <td>

                            <span
                              className={
                                lawyer.status ===
                                "Approved"
                                  ? "badge bg-success"
                                  : lawyer.status ===
                                    "Rejected"
                                  ? "badge bg-danger"
                                  : "badge bg-warning text-dark"
                              }
                            >
                              {
                                lawyer.status
                              }
                            </span>

                          </td>

                          <td>

                            <div className="d-flex gap-2 flex-wrap">

                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  setSelectedLawyer(
                                    lawyer
                                  )
                                }
                              >
                                👁️ View
                              </button>

                              {lawyer.status !==
                                "Approved" && (

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

                              {lawyer.status !==
                                "Rejected" && (

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

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center text-muted"
                      >
                        No lawyers registered.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* ==============================
            USERS
        ============================== */}

        {activeSection ===
          "users" && (

          <div className="card shadow-sm p-4">

            <div className="mb-4">

              <h3 className="fw-bold">
                👥 User Management
              </h3>

              <p className="text-muted">
                Manage client and lawyer
                accounts.
              </p>

            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>

                  <tr>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.length >
                  0 ? (

                    users.map(
                      (user) => (

                        <tr
                          key={
                            user.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                user.name
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              user.email
                            }
                          </td>

                          <td>

                            <span
                              className={
                                user.role ===
                                "Lawyer"
                                  ? "badge bg-primary"
                                  : "badge bg-secondary"
                              }
                            >
                              {
                                user.role
                              }
                            </span>

                          </td>

                          <td>

                            <span
                              className={
                                user.status ===
                                "Active"
                                  ? "badge bg-success"
                                  : "badge bg-danger"
                              }
                            >
                              {
                                user.status
                              }
                            </span>

                          </td>

                          <td>

                            <button
                              className={
                                user.status ===
                                "Active"
                                  ? "btn btn-sm btn-outline-danger"
                                  : "btn btn-sm btn-outline-success"
                              }
                              onClick={() =>
                                updateUserStatus(
                                  user.id
                                )
                              }
                            >
                              {user.status ===
                              "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center text-muted"
                      >
                        No registered users yet.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* ==============================
            APPOINTMENTS
        ============================== */}

        {activeSection ===
          "appointments" && (

          <div className="card shadow-sm p-4">

            <div className="mb-4">

              <h3 className="fw-bold">
                📅 Appointment Management
              </h3>

              <p className="text-muted">
                Monitor all platform
                consultations.
              </p>

            </div>

            <div className="table-responsive">

              <table className="table align-middle">

                <thead>

                  <tr>

                    <th>
                      Client
                    </th>

                    <th>
                      Lawyer
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {appointments.length >
                  0 ? (

                    appointments.map(
                      (appointment) => (

                        <tr
                          key={
                            appointment.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                appointment.client
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              appointment.lawyer
                            }
                          </td>

                          <td>
                            {
                              appointment.date
                            }
                          </td>

                          <td>
                            {
                              appointment.time
                            }
                          </td>

                          <td>
                            {
                              appointment.type
                            }
                          </td>

                          <td>

                            <span
                              className={
                                appointment.status ===
                                "Confirmed"
                                  ? "badge bg-success"
                                  : appointment.status ===
                                    "Completed"
                                  ? "badge bg-primary"
                                  : appointment.status ===
                                    "Cancelled"
                                  ? "badge bg-danger"
                                  : appointment.status ===
                                    "Rejected"
                                  ? "badge bg-danger"
                                  : "badge bg-warning text-dark"
                              }
                            >
                              {
                                appointment.status
                              }
                            </span>

                          </td>

                          <td>

                            {appointment.status ===
                              "Pending" && (

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

                            {appointment.status ===
                              "Confirmed" && (

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

                            {appointment.status ===
                              "Completed" && (

                              <span className="text-primary">
                                ✓ Completed
                              </span>

                            )}

                            {appointment.status ===
                              "Cancelled" && (

                              <span className="text-danger">
                                ✕ Cancelled
                              </span>

                            )}

                            {appointment.status ===
                              "Rejected" && (

                              <span className="text-danger">
                                ✕ Rejected
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center text-muted"
                      >
                        No appointments found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* ==============================
            LAWYER DETAILS
        ============================== */}

        {selectedLawyer && (

          <div className="card shadow-lg p-4 mt-4">

            <div className="d-flex justify-content-between">

              <h3 className="fw-bold">
                Lawyer Details
              </h3>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSelectedLawyer(
                    null
                  )
                }
              >
                ✕
              </button>

            </div>

            <hr />

            <div className="row g-3">

              <div className="col-md-6">

                <strong>
                  Lawyer Name
                </strong>

                <p>
                  {
                    selectedLawyer.name
                  }
                </p>

              </div>

              <div className="col-md-6">

                <strong>
                  Practice Area
                </strong>

                <p>
                  {
                    selectedLawyer.specialization ||
                    "Not Selected"
                  }
                </p>

              </div>

              <div className="col-md-6">

                <strong>
                  City
                </strong>

                <p>
                  {
                    selectedLawyer.city ||
                    "Not Selected"
                  }
                </p>

              </div>

              <div className="col-md-6">

                <strong>
                  Experience
                </strong>

                <p>
                  {
                    selectedLawyer.experience ||
                    0
                  }{" "}
                  Years
                </p>

              </div>

              <div className="col-md-6">

                <strong>
                  Consultation Fee
                </strong>

                <p>
                  ₹
                  {
                    selectedLawyer.fee ||
                    0
                  }
                </p>

              </div>

              <div className="col-md-6">

                <strong>
                  Verification Status
                </strong>

                <p>
                  {
                    selectedLawyer.status
                  }
                </p>

              </div>

              {selectedLawyer.email && (

                <div className="col-md-6">

                  <strong>
                    Email
                  </strong>

                  <p>
                    {
                      selectedLawyer.email
                    }
                  </p>

                </div>

              )}

              {selectedLawyer.phone && (

                <div className="col-md-6">

                  <strong>
                    Phone
                  </strong>

                  <p>
                    {
                      selectedLawyer.phone
                    }
                  </p>

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