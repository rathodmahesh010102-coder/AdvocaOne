import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function MyBookings() {
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem("advocaOneBookings");

    return savedBookings
      ? JSON.parse(savedBookings)
      : [];
  });

  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleCancel = (id) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === id
        ? { ...booking, status: "Cancelled" }
        : booking
    );

    setBookings(updatedBookings);

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(updatedBookings)
    );

    setSelectedBooking(null);
  };

  const handleDelete = (id) => {
    const updatedBookings = bookings.filter(
      (booking) => booking.id !== id
    );

    setBookings(updatedBookings);

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(updatedBookings)
    );

    setSelectedBooking(null);
  };

  return (
    <div className="dashboard-page">

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

        <h1 className="fw-bold mb-2">
          My Consultations
        </h1>

        <p className="text-muted mb-4">
          View and manage your legal consultation appointments.
        </p>

        {bookings.length === 0 ? (

          <div className="card shadow-sm p-5 text-center">

            <div style={{ fontSize: "60px" }}>
              📅
            </div>

            <h3 className="fw-bold mt-3">
              No Consultations Yet
            </h3>

            <p className="text-muted">
              You have not booked any legal consultation yet.
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

          bookings.map((booking) => (

            <div
              className="card shadow-sm p-4 mb-4"
              key={booking.id}
            >

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>

                  <h4 className="fw-bold">
                    ⚖️ {booking.lawyerName}
                  </h4>

                  <p className="mb-1">
                    <strong>Practice Area:</strong>{" "}
                    {booking.specialization}
                  </p>

                  <p className="mb-1">
                    <strong>Location:</strong>{" "}
                    {booking.location}
                  </p>

                  <p className="mb-1">
                    <strong>📅 Date:</strong>{" "}
                    {booking.date}
                  </p>

                  {booking.day && (
                    <p className="mb-1">
                      <strong>🗓️ Day:</strong>{" "}
                      {booking.day}
                    </p>
                  )}

                  <p className="mb-1">
                    <strong>🕐 Time:</strong>{" "}
                    {booking.time}
                  </p>

                  <p className="mb-1">
                    <strong>Consultation:</strong>{" "}
                    {booking.consultationType}
                  </p>

                  <p className="mb-0">
                    <strong>💰 Fee:</strong>{" "}
                    ₹{booking.fee}
                  </p>

                </div>

                <span
                  className={
                    booking.status === "Confirmed"
                      ? "badge bg-success"
                      : booking.status === "Cancelled"
                      ? "badge bg-danger"
                      : "badge bg-warning text-dark"
                  }
                >
                  {booking.status}
                </span>

              </div>

              <hr />

              <div className="d-flex gap-2 flex-wrap">

                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    setSelectedBooking(booking)
                  }
                >
                  👁️ View Details
                </button>

                {booking.status !== "Cancelled" && (

                  <button
                    className="btn btn-outline-danger"
                    onClick={() =>
                      handleCancel(booking.id)
                    }
                  >
                    ❌ Cancel
                  </button>

                )}

                {booking.status === "Cancelled" && (

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      handleDelete(booking.id)
                    }
                  >
                    🗑️ Remove
                  </button>

                )}

              </div>

            </div>

          ))

        )}

        {selectedBooking && (

          <div className="card shadow-lg p-4 mt-4">

            <div className="d-flex justify-content-between align-items-center">

              <h3 className="fw-bold mb-0">
                📋 Consultation Details
              </h3>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                ✕
              </button>

            </div>

            <hr />

            <p>
              <strong>⚖️ Lawyer:</strong>{" "}
              {selectedBooking.lawyerName}
            </p>

            <p>
              <strong>Practice Area:</strong>{" "}
              {selectedBooking.specialization}
            </p>

            <p>
              <strong>📍 Location:</strong>{" "}
              {selectedBooking.location}
            </p>

            <p>
              <strong>👤 Client Name:</strong>{" "}
              {selectedBooking.userName}
            </p>

            <p>
              <strong>📧 Email:</strong>{" "}
              {selectedBooking.userEmail}
            </p>

            <p>
              <strong>📱 Phone:</strong>{" "}
              {selectedBooking.userPhone}
            </p>

            <hr />

            <p>
              <strong>📅 Date:</strong>{" "}
              {selectedBooking.date}
            </p>

            {selectedBooking.day && (
              <p>
                <strong>🗓️ Day:</strong>{" "}
                {selectedBooking.day}
              </p>
            )}

            <p>
              <strong>🕐 Time:</strong>{" "}
              {selectedBooking.time}
            </p>

            <p>
              <strong>💻 Consultation Type:</strong>{" "}
              {selectedBooking.consultationType}
            </p>

            <p>
              <strong>📝 Reason:</strong>{" "}
              {selectedBooking.reason}
            </p>

            <p>
              <strong>💰 Consultation Fee:</strong>{" "}
              ₹{selectedBooking.fee}
            </p>

            <p>
              <strong>📌 Status:</strong>{" "}
              {selectedBooking.status}
            </p>

          </div>

        )}

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