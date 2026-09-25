import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function LawyerDashboard() {
  const getLawyer = () => {
    const lawyers =
      JSON.parse(localStorage.getItem("advocaOneAdminLawyers")) || [];

    return (
      lawyers.find((lawyer) => lawyer.name === "Adv. Mahesh Test") ||
      lawyers[lawyers.length - 1]
    );
  };

  const currentLawyer = getLawyer();

  const [onlineStatus, setOnlineStatus] = useState(
    currentLawyer?.onlineStatus || "Offline"
  );

  const [appointmentStatus, setAppointmentStatus] = useState(
    currentLawyer?.appointmentStatus || "Accepting Appointments"
  );

  const [appointments, setAppointments] = useState(() => {
    const savedBookings =
      JSON.parse(localStorage.getItem("advocaOneBookings")) || [];

    return savedBookings.map((booking, index) => ({
      ...booking,
      id: booking.id || index + 1,
      client:
        booking.client ||
        booking.clientName ||
        booking.name ||
        booking.userName ||
        "Client",
      date:
        booking.date ||
        booking.bookingDate ||
        "Date not available",
      time:
        booking.time ||
        booking.bookingTime ||
        "Time not available",
      type:
        booking.type ||
        booking.consultationType ||
        booking.mode ||
        "Online",
      reason:
        booking.reason ||
        booking.message ||
        booking.consultationReason ||
        "Consultation",
      fee: Number(booking.fee || booking.consultationFee || 0),
      status: booking.status || "Pending",
    }));
  });

  const updateLawyerStatus = (field, value) => {
    const lawyers =
      JSON.parse(localStorage.getItem("advocaOneAdminLawyers")) || [];

    const updatedLawyers = lawyers.map((lawyer) => {
      if (lawyer.id === currentLawyer?.id) {
        return {
          ...lawyer,
          [field]: value,
        };
      }

      return lawyer;
    });

    localStorage.setItem(
      "advocaOneAdminLawyers",
      JSON.stringify(updatedLawyers)
    );
  };

  const changeOnlineStatus = (status) => {
    setOnlineStatus(status);
    updateLawyerStatus("onlineStatus", status);
  };

  const changeAppointmentStatus = (status) => {
    setAppointmentStatus(status);
    updateLawyerStatus("appointmentStatus", status);
  };

  const updateAppointment = (id, status) => {
    const savedBookings =
      JSON.parse(localStorage.getItem("advocaOneBookings")) || [];

    const updatedBookings = savedBookings.map((booking) =>
      String(booking.id) === String(id)
        ? {
            ...booking,
            status,
          }
        : booking
    );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(updatedBookings)
    );

    const updatedAppointments = appointments.map((appointment) =>
      String(appointment.id) === String(id)
        ? {
            ...appointment,
            status,
          }
        : appointment
    );

    setAppointments(updatedAppointments);
  };

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const completedCount = appointments.filter(
  (appointment) => appointment.status === "Completed"
).length;

  const estimatedEarnings = appointments
    .filter((appointment) => appointment.status === "Confirmed")
    .reduce((total, appointment) => total + Number(appointment.fee || 0), 0);

  const today = new Date();

  const todayString = today.toISOString().split("T")[0];

  const todaysAppointments = appointments.filter(
    (appointment) => appointment.date === todayString
  );

  const onlineStatusClass =
    onlineStatus === "Online"
      ? "bg-success"
      : onlineStatus === "Away"
      ? "bg-warning text-dark"
      : "bg-danger";

  const appointmentStatusClass =
    appointmentStatus === "Accepting Appointments"
      ? "bg-success"
      : appointmentStatus === "Busy"
      ? "bg-warning text-dark"
      : "bg-danger";

  return (
    <div className="lawyer-dashboard-page">
      <div className="container py-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Lawyer Dashboard</h2>
            <p className="text-muted">
              Manage your profile, availability and client appointments.
            </p>
          </div>

          <Link to="/" className="btn btn-outline-primary">
            Home
          </Link>
        </div>

        <div className="row g-4 mb-4">

          <div className="col-md-3">
            <div className="card shadow-sm p-4 h-100">
              <h6 className="text-muted">Total Appointments</h6>
              <h2>{appointments.length}</h2>
              <p className="mb-0">📅 All appointments</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 h-100">
              <h6 className="text-muted">Pending</h6>
              <h2>{pendingCount}</h2>
              <p className="mb-0">⏳ Need action</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 h-100">
              <h6 className="text-muted">Confirmed</h6>
              <h2>{confirmedCount}</h2>
              <p className="mb-0">✅ Confirmed appointments</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 h-100">
              <h6 className="text-muted">Completed</h6>
              <h2> {completedCount}</h2>
                  <p className="mb-0">🏁 Completed appointments</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm p-4 h-100">
              <h6 className="text-muted">Estimated Earnings</h6>
              <h2>₹{estimatedEarnings}</h2>
              <p className="mb-0">💰 Confirmed appointments</p>
            </div>
          </div>

        </div>

        <div className="row g-4 mb-4">

          <div className="col-md-6">
            <div className="card shadow-sm p-4 h-100">

              <h5>🟢 Online Status</h5>

              <p className="text-muted">
                Show clients whether you are currently online.
              </p>

              <div className="d-flex gap-2 flex-wrap">

                <button
                  className={
                    onlineStatus === "Online"
                      ? "btn btn-success"
                      : "btn btn-outline-success"
                  }
                  onClick={() => changeOnlineStatus("Online")}
                >
                  🟢 Online
                </button>

                <button
                  className={
                    onlineStatus === "Away"
                      ? "btn btn-warning"
                      : "btn btn-outline-warning"
                  }
                  onClick={() => changeOnlineStatus("Away")}
                >
                  🟡 Away
                </button>

                <button
                  className={
                    onlineStatus === "Offline"
                      ? "btn btn-danger"
                      : "btn btn-outline-danger"
                  }
                  onClick={() => changeOnlineStatus("Offline")}
                >
                  🔴 Offline
                </button>

              </div>

              <p className="mt-3 mb-0">
                <strong>Current Status:</strong>{" "}
                <span className={`badge ${onlineStatusClass}`}>
                  {onlineStatus}
                </span>
              </p>

            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm p-4 h-100">

              <h5>📅 Appointment Status</h5>

              <p className="text-muted">
                Control whether clients can book new appointments.
              </p>

              <div className="d-flex gap-2 flex-wrap">

                <button
                  className={
                    appointmentStatus === "Accepting Appointments"
                      ? "btn btn-success"
                      : "btn btn-outline-success"
                  }
                  onClick={() =>
                    changeAppointmentStatus(
                      "Accepting Appointments"
                    )
                  }
                >
                  🟢 Accepting Appointments
                </button>

                <button
                  className={
                    appointmentStatus === "Busy"
                      ? "btn btn-warning"
                      : "btn btn-outline-warning"
                  }
                  onClick={() => changeAppointmentStatus("Busy")}
                >
                  🟡 Busy
                </button>

                <button
                  className={
                    appointmentStatus === "Not Accepting"
                      ? "btn btn-danger"
                      : "btn btn-outline-danger"
                  }
                  onClick={() =>
                    changeAppointmentStatus("Not Accepting")
                  }
                >
                  🔴 Not Accepting
                </button>

              </div>

              <p className="mt-3 mb-0">
                <strong>Current Status:</strong>{" "}
                <span className={`badge ${appointmentStatusClass}`}>
                  {appointmentStatus}
                </span>
              </p>

            </div>
          </div>

        </div>

        <div className="card shadow-sm p-4 mb-4">

          <h4>📅 Today's Appointments</h4>

          <p className="text-muted">
            Appointments scheduled for today.
          </p>

          {todaysAppointments.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="row g-3">

              {todaysAppointments.map((appointment) => (
                <div
                  className="col-md-6"
                  key={appointment.id}
                >
                  <div className="card border shadow-sm h-100">
                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-start">

                        <div>
                          <h5 className="mb-1">
                            {appointment.client}
                          </h5>

                          <p className="text-muted mb-2">
                            🕐 {appointment.time}
                          </p>
                        </div>

                        <span
                          className={`badge ${
                            appointment.status === "Confirmed"
                              ? "bg-success"
                              : appointment.status === "Rejected" ||
                                appointment.status === "Cancelled"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {appointment.status}
                        </span>

                      </div>

                      <p className="mb-1">
                        <strong>Consultation:</strong>{" "}
                        {appointment.type}
                      </p>

                      <p className="mb-1">
                        <strong>Reason:</strong>{" "}
                        {appointment.reason}
                      </p>

                      <p className="mb-0">
                        <strong>Fee:</strong>{" "}
                        ₹{appointment.fee}
                      </p>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        <div className="card shadow-sm p-4 mb-4">

          <h4>📋 All Appointments</h4>

          <p className="text-muted">
            Manage your client consultation requests.
          </p>

          <div className="table-responsive">

            <table className="table table-bordered align-middle">

              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>

                      <td>
                        <strong>{appointment.client}</strong>
                      </td>

                      <td>{appointment.date}</td>

                      <td>{appointment.time}</td>

                      <td>{appointment.type}</td>

                      <td>{appointment.reason}</td>

                      <td>₹{appointment.fee}</td>

                      <td>
                        <span
                          className={`badge ${
                            appointment.status === "Confirmed"
                              ? "bg-success"
                              : appointment.status === "Rejected"
                              ? "bg-danger"
                              : appointment.status === "Cancelled"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      <td>
                        {appointment.status === "Pending" ? (
                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                updateAppointment(
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
                                updateAppointment(
                                  appointment.id,
                                  "Rejected"
                                )
                              }
                            >
                              ✕ Reject
                            </button>

                          </div>
                        ) : (
                          <span className="text-muted">
                            {appointment.status}
                          </span>
                        )}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="d-flex gap-3 flex-wrap">

          <Link
            to="/lawyer-profile-manage"
            className="btn btn-primary"
          >
            👤 Manage Profile
          </Link>

          <Link
            to="/manage-availability"
            className="btn btn-outline-primary"
          >
            📅 Manage Availability
          </Link>

        </div>

      </div>
    </div>
  );
}

export default LawyerDashboard;

