import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

// ========================================
// GET LOGGED-IN USER
// ========================================

function getLoggedInUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "advocaOneLoggedInUser"
        ) || "null"
      ) || null
    );
  } catch {
    return null;
  }
}

// ========================================
// LOAD CURRENT CLIENT BOOKINGS
// ========================================

function loadClientBookings() {
  let savedBookings = [];
  let loggedInUser = null;

  try {
    savedBookings =
      JSON.parse(
        localStorage.getItem(
          "advocaOneBookings"
        ) || "[]"
      ) || [];
  } catch {
    savedBookings = [];
  }

  loggedInUser =
    getLoggedInUser();

  const loggedInEmail =
    loggedInUser?.email
      ?.trim()
      .toLowerCase() || "";

  if (!loggedInEmail) {
    return [];
  }

  return savedBookings.filter(
    (booking) =>
      booking.userEmail
        ?.trim()
        .toLowerCase() ===
      loggedInEmail
  );
}

// ========================================
// COMPONENT
// ========================================

function MyBookings() {
  const [bookings, setBookings] =
    useState(loadClientBookings);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  // ========================================
  // CANCEL BOOKING
  // ========================================

  const handleCancel = (id) => {
    let savedBookings = [];

    try {
      savedBookings =
        JSON.parse(
          localStorage.getItem(
            "advocaOneBookings"
          ) || "[]"
        ) || [];
    } catch {
      savedBookings = [];
    }

    const loggedInUser =
      getLoggedInUser();

    const loggedInEmail =
      loggedInUser?.email
        ?.trim()
        .toLowerCase() || "";

    const updatedBookings =
      savedBookings.map(
        (booking) => {
          const bookingEmail =
            booking.userEmail
              ?.trim()
              .toLowerCase() || "";

          if (
            String(booking.id) ===
              String(id) &&
            bookingEmail ===
              loggedInEmail
          ) {
            return {
              ...booking,
              status: "Cancelled",
            };
          }

          return booking;
        }
      );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(
        updatedBookings
      )
    );

    setBookings(
      updatedBookings.filter(
        (booking) =>
          booking.userEmail
            ?.trim()
            .toLowerCase() ===
          loggedInEmail
      )
    );

    setSelectedBooking(null);
  };

  // ========================================
  // DELETE / REMOVE CANCELLED BOOKING
  // ========================================

  const handleDelete = (id) => {
    let savedBookings = [];

    try {
      savedBookings =
        JSON.parse(
          localStorage.getItem(
            "advocaOneBookings"
          ) || "[]"
        ) || [];
    } catch {
      savedBookings = [];
    }

    const loggedInUser =
      getLoggedInUser();

    const loggedInEmail =
      loggedInUser?.email
        ?.trim()
        .toLowerCase() || "";

    const updatedBookings =
      savedBookings.filter(
        (booking) => {
          const bookingEmail =
            booking.userEmail
              ?.trim()
              .toLowerCase() || "";

          const isCurrentClient =
            bookingEmail ===
            loggedInEmail;

          const isSelectedBooking =
            String(booking.id) ===
            String(id);

          return !(
            isCurrentClient &&
            isSelectedBooking
          );
        }
      );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(
        updatedBookings
      )
    );

    setBookings(
      updatedBookings.filter(
        (booking) =>
          booking.userEmail
            ?.trim()
            .toLowerCase() ===
          loggedInEmail
      )
    );

    setSelectedBooking(null);
  };

  return (
    <div className="dashboard-page">

      {/* ========================================
          NAVBAR
      ======================================== */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <Link
            to="/dashboard"
            className="btn btn-outline-light"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>

      <div className="container py-5">

        {/* ========================================
            HEADER
        ======================================== */}

        <h1 className="fw-bold mb-2">
          My Consultations
        </h1>

        <p className="text-muted mb-4">
          View and manage your legal
          consultation appointments.
        </p>

        {/* ========================================
            NO BOOKINGS
        ======================================== */}

        {bookings.length === 0 ? (

          <div className="card shadow-sm p-5 text-center">

            <div
              style={{
                fontSize: "60px",
              }}
            >
              📅
            </div>

            <h3 className="fw-bold mt-3">
              No Consultations Yet
            </h3>

            <p className="text-muted">
              You have not booked any legal
              consultation yet.
            </p>

            <div>

              <Link
                to="/"
                className="btn btn-primary"
              >
                🔍 Find a Lawyer
              </Link>

            </div>

          </div>

        ) : (

          /* ========================================
             BOOKINGS
          ======================================== */

          bookings.map(
            (booking) => (

              <div
                className="card shadow-sm p-4 mb-4"
                key={booking.id}
              >

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                  <div>

                    <h4 className="fw-bold">
                      ⚖️{" "}
                      {booking.lawyerName ||
                        "Lawyer"}
                    </h4>

                    <p className="mb-1">
                      <strong>
                        Practice Area:
                      </strong>{" "}
                      {booking.specialization ||
                        "Not Selected"}
                    </p>

                    <p className="mb-1">
                      <strong>
                        Location:
                      </strong>{" "}
                      {booking.location ||
                        "Not Selected"}
                    </p>

                    <p className="mb-1">
                      <strong>
                        📅 Date:
                      </strong>{" "}
                      {booking.date ||
                        "Not Selected"}
                    </p>

                    {booking.day && (

                      <p className="mb-1">
                        <strong>
                          🗓️ Day:
                        </strong>{" "}
                        {booking.day}
                      </p>

                    )}

                    <p className="mb-1">
                      <strong>
                        🕐 Time:
                      </strong>{" "}
                      {booking.time ||
                        "Not Selected"}
                    </p>

                    <p className="mb-1">
                      <strong>
                        Consultation:
                      </strong>{" "}
                      {booking.consultationType ||
                        booking.type ||
                        "Online"}
                    </p>

                    <p className="mb-0">
                      <strong>
                        💰 Fee:
                      </strong>{" "}
                      ₹
                      {booking.fee ||
                        0}
                    </p>

                  </div>

                  <span
                    className={
                      booking.status ===
                      "Confirmed"
                        ? "badge bg-success"
                        : booking.status ===
                          "Completed"
                        ? "badge bg-primary"
                        : booking.status ===
                          "Rejected"
                        ? "badge bg-danger"
                        : booking.status ===
                          "Cancelled"
                        ? "badge bg-danger"
                        : "badge bg-warning text-dark"
                    }
                  >
                    {booking.status ||
                      "Pending"}
                  </span>

                </div>

                <hr />

                {/* ========================================
                    ACTIONS
                ======================================== */}

                <div className="d-flex gap-2 flex-wrap">

                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      setSelectedBooking(
                        booking
                      )
                    }
                  >
                    👁️ View Details
                  </button>

                  {booking.status !==
                    "Cancelled" &&
                    booking.status !==
                      "Completed" &&
                    booking.status !==
                      "Rejected" && (

                    <button
                      className="btn btn-outline-danger"
                      onClick={() =>
                        handleCancel(
                          booking.id
                        )
                      }
                    >
                      ❌ Cancel
                    </button>

                  )}

                  {booking.status ===
                    "Cancelled" && (

                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        handleDelete(
                          booking.id
                        )
                      }
                    >
                      🗑️ Remove
                    </button>

                  )}

                </div>

              </div>

            )
          )

        )}

        {/* ========================================
            SELECTED BOOKING DETAILS
        ======================================== */}

        {selectedBooking && (

          <div className="card shadow-lg p-4 mt-4">

            <div className="d-flex justify-content-between align-items-center">

              <h3 className="fw-bold mb-0">
                📋 Consultation Details
              </h3>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
              >
                ✕
              </button>

            </div>

            <hr />

            <p>
              <strong>
                ⚖️ Lawyer:
              </strong>{" "}
              {selectedBooking.lawyerName}
            </p>

            <p>
              <strong>
                Practice Area:
              </strong>{" "}
              {selectedBooking.specialization}
            </p>

            <p>
              <strong>
                📍 Location:
              </strong>{" "}
              {selectedBooking.location}
            </p>

            <p>
              <strong>
                👤 Client Name:
              </strong>{" "}
              {selectedBooking.userName}
            </p>

            <p>
              <strong>
                📧 Email:
              </strong>{" "}
              {selectedBooking.userEmail}
            </p>

            <p>
              <strong>
                📱 Phone:
              </strong>{" "}
              {selectedBooking.userPhone}
            </p>

            <hr />

            <p>
              <strong>
                📅 Date:
              </strong>{" "}
              {selectedBooking.date}
            </p>

            {selectedBooking.day && (

              <p>
                <strong>
                  🗓️ Day:
                </strong>{" "}
                {selectedBooking.day}
              </p>

            )}

            <p>
              <strong>
                🕐 Time:
              </strong>{" "}
              {selectedBooking.time}
            </p>

            <p>
              <strong>
                💻 Consultation Type:
              </strong>{" "}
              {selectedBooking.consultationType ||
                selectedBooking.type}
            </p>

            <p>
              <strong>
                📝 Reason:
              </strong>{" "}
              {selectedBooking.reason ||
                "Not provided"}
            </p>

            <p>
              <strong>
                💰 Consultation Fee:
              </strong>{" "}
              ₹
              {selectedBooking.fee ||
                0}
            </p>

            <p>
              <strong>
                📌 Status:
              </strong>{" "}
              {selectedBooking.status}
            </p>

          </div>

        )}

        {/* ========================================
            FIND LAWYER
        ======================================== */}

        <div className="text-center mt-5">

          <p className="text-muted">
            Need another consultation?
          </p>

          <Link
            to="/"
            className="btn btn-primary"
          >
            🔍 Find a Lawyer
          </Link>

        </div>

      </div>

    </div>
  );
}

export default MyBookings;