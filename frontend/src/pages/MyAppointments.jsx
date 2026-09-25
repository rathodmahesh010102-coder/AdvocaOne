import { useEffect, useState } from "react";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const availability = JSON.parse(
    localStorage.getItem("advocaOneAvailability") || "{}",
  );

  const selectedRescheduleDay = newDate
    ? new Date(`${newDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "";

const availableRescheduleSlots =
  availability[selectedRescheduleDay] || [];
  // Cancel Appointment
  const handleCancel = (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmCancel) {
      return;
    }

    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === id
        ? { ...appointment, status: "Cancelled" }
        : appointment,
    );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(updatedAppointments),
    );

    setAppointments(updatedAppointments);
  };

  // Reschedule Appointment
  const handleReschedule = () => {
    if (!rescheduleAppointment) {
      return;
    }

    if (
      newDate === rescheduleAppointment.date &&
      newTime === rescheduleAppointment.time
    ) {
      alert("Please select a different date or time.");
      return;
    }
    if (rescheduleAppointment.status === "Cancelled") {
      alert("Cancelled appointments cannot be rescheduled.");
      return;
    }

    if (!newDate || !newTime) {
      alert("Please select a new date and time.");
      return;
    }
    const availability = JSON.parse(
      localStorage.getItem("advocaOneAvailability") || "{}",
    );

    const selectedDay = new Date(`${newDate}T00:00:00`).toLocaleDateString(
      "en-US",
      { weekday: "long" },
    );

    const availableSlots = availability[selectedDay] || [];

    if (!availableSlots.includes(newTime)) {
      alert(
        `⚠️ ${selectedDay} at ${newTime} is not available for this lawyer. Please select an available time slot.`,
      );
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (newDate === today) {
      const now = new Date();

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [time, period] = newTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      const selectedMinutes = hours * 60 + minutes;

      if (selectedMinutes <= currentMinutes) {
        alert("Please select a future time.");
        return;
      }
    }

    const existingBookings = JSON.parse(
      localStorage.getItem("advocaOneBookings") || "[]",
    );

    const isSlotBooked = existingBookings.some(
      (booking) =>
        String(booking.lawyerId) === String(rescheduleAppointment.lawyerId) &&
        booking.date === newDate &&
        booking.time === newTime &&
        booking.id !== rescheduleAppointment.id &&
        booking.status !== "Cancelled" &&
        booking.status !== "Rejected",
    );

    if (isSlotBooked) {
      alert("⚠️ This time slot is already booked. Please select another time.");
      return;
    }
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === rescheduleAppointment.id
        ? {
            ...appointment,
            date: newDate,
            day: selectedDay,
            time: newTime,
            status: "Pending",
          }
        : appointment,
    );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(updatedAppointments),
    );

    setAppointments(updatedAppointments);

    setRescheduleAppointment(null);
    setNewDate("");
    setNewTime("");

    alert(
      "Appointment rescheduled successfully!\nYour new appointment is pending confirmation.",
    );
  };

  // Load appointments
 // Load appointments
useEffect(() => {
  const bookings = localStorage.getItem("advocaOneBookings");

  console.log("My Appointments - bookings:", bookings);

  if (bookings) {
    try {
      const parsedBookings = JSON.parse(bookings);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedBookings = parsedBookings.map((appointment) => {
        if (
          appointment.status === "Confirmed" &&
          appointment.date
        ) {
          const appointmentDate = new Date(
            `${appointment.date}T00:00:00`
          );

          if (appointmentDate < today) {
            return {
              ...appointment,
              status: "Completed",
            };
          }
        }

        return appointment;
      });

      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(updatedBookings)
      );

      setAppointments(updatedBookings);

      console.log("Updated appointments:", updatedBookings);
    } catch (error) {
      console.error("Error parsing bookings:", error);
    }
  }
}, []);

  // Counts
  const totalCount = appointments.length;

  // Upcoming and Past Appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((appointment) => {
    if (!appointment.date) return false;

    const appointmentDate = new Date(`${appointment.date}T00:00:00`);

    return appointmentDate >= today && appointment.status !== "Cancelled";
  });

  const pastAppointments = appointments.filter((appointment) => {
    if (!appointment.date) return false;

    const appointmentDate = new Date(`${appointment.date}T00:00:00`);

    return appointmentDate < today;
  });

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "Pending",
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "Confirmed",
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "Cancelled",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  // Filter + Search
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter =
      filter === "All" ||
      appointment.status === filter ||
      (filter === "Upcoming" &&
        upcomingAppointments.some((item) => item.id === appointment.id)) ||
      (filter === "Past" &&
        pastAppointments.some((item) => item.id === appointment.id));

    const searchText = search.toLowerCase();

    const matchesSearch =
      appointment.lawyerName?.toLowerCase().includes(searchText) ||
      appointment.specialization?.toLowerCase().includes(searchText) ||
      appointment.location?.toLowerCase().includes(searchText) ||
      appointment.reason?.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <div className="container mt-5 pt-5">
        {/* Page Header */}
        <h2 className="mb-2">My Appointments</h2>

        <p className="text-muted mb-4">
          View and manage your legal consultation appointments.
        </p>

        {/* Appointment Counts */}
        <div className="row mb-4">
          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Total</h6>
                <h3>{totalCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Pending</h6>
                <h3>{pendingCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Confirmed</h6>
                <h3>{confirmedCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Cancelled</h6>
                <h3>{cancelledCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Completed</h6>
                <h3>{completedCount}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Upcoming</h6>
                <h3>{upcomingAppointments.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-2">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Past</h6>
                <h3>{pastAppointments.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by lawyer, specialization, location or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mb-4">
          {[
            "All",
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled",
            "Upcoming",
            "Past",
          ].map((status) => (
            <button
              key={status}
              className={`btn ${
                filter === status ? "btn-primary" : "btn-outline-primary"
              } me-2 mb-2`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments */}
        {appointments.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "50px" }}>📅</div>

            <h4 className="mt-3">No Appointments Found</h4>

            <p className="text-muted">You don't have any appointments yet.</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "50px" }}>🔍</div>

            <h4 className="mt-3">No Matching Appointments</h4>

            <p className="text-muted">Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="row">
            {filteredAppointments.map((appointment) => (
              <div className="col-md-6 col-lg-4 mb-4" key={appointment.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    {/* Lawyer Name */}
                    <h5 className="card-title">{appointment.lawyerName}</h5>

                    {/* Status Badge */}
                    <span
                      className={`badge ${
  appointment.status === "Confirmed"
    ? "bg-success"
    : appointment.status === "Completed"
      ? "bg-primary"
      : appointment.status === "Cancelled"
        ? "bg-danger"
        : "bg-warning text-dark"
}`}
                    >
                      {appointment.status || "Pending"}
                    </span>

                    {/* Appointment ID */}
                    <small className="text-muted d-block mb-3">
                      Appointment ID: {appointment.id}
                    </small>

                    {/* Specialization */}
                    <p className="mb-2">
                      <strong>Specialization:</strong>{" "}
                      {appointment.specialization || "Not specified"}
                    </p>

                    {/* Location */}
                    <p className="mb-2">
                      <strong>Location:</strong>{" "}
                      {appointment.location || "Not specified"}
                    </p>

                    {/* Date */}
                    <p className="mb-2">
                      <strong>Date:</strong>{" "}
                      {appointment.date || "Not specified"}
                    </p>

                    {/* Time */}
                    <p className="mb-2">
                      <strong>Time:</strong>{" "}
                      {appointment.time || "Not specified"}
                    </p>

                    {/* Reason */}
                    <p className="mb-2">
                      <strong>Reason:</strong>{" "}
                      {appointment.reason || "Not specified"}
                    </p>

                    {/* Fee */}
                    <p className="mb-3">
                      <strong>Fee:</strong> ₹{appointment.fee || 0}
                    </p>

                    {/* Cancel Button */}
                    {appointment.status !== "Cancelled" && 
                    appointment.status !== "Completed" && (
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel Appointment
                      </button>
                    )}

                    {/* View Details Button */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      View Details
                    </button>

                    {/* Reschedule Button */}
                    {appointment.status !== "Cancelled" &&
                    appointment.status !== "Completed" &&
                      !pastAppointments.some(
                        (item) => item.id === appointment.id,
                      ) && (

                        <button
                          className="btn btn-warning btn-sm ms-2"
                          onClick={() => {
                            setRescheduleAppointment(appointment);
                            setNewDate(appointment.date || "");
                            setNewTime(appointment.time || "");
                          }}
                        >
                          Reschedule
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">Appointment Details</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAppointment(null)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p>
                  <strong>Lawyer:</strong> {selectedAppointment.lawyerName}
                </p>

                <p>
                  <strong>Specialization:</strong>{" "}
                  {selectedAppointment.specialization || "Not specified"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedAppointment.location || "Not specified"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {selectedAppointment.date || "Not specified"}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {selectedAppointment.time || "Not specified"}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {selectedAppointment.reason || "Not specified"}
                </p>

                <p>
                  <strong>Consultation Fee:</strong> ₹
                  {selectedAppointment.fee || 0}
                </p>

              <p>
  <strong>Status:</strong>{" "}
  <span
    className={`badge ${
      selectedAppointment.status === "Confirmed"
        ? "bg-success"
        : selectedAppointment.status === "Completed"
          ? "bg-primary"
          : selectedAppointment.status === "Cancelled"
            ? "bg-danger"
            : "bg-warning text-dark"
    }`}
  >
    {selectedAppointment.status || "Pending"}
  </span>
</p>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Appointment</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setRescheduleAppointment(null);
                    setNewDate("");
                    setNewTime("");
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p>
                  <strong>Lawyer:</strong> {rescheduleAppointment.lawyerName}
                </p>

                <div className="mb-3">
                  <label className="form-label">New Date</label>

                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split("T")[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                {newDate && (
                  <div className="alert alert-info">
                    🗓️ <strong>Selected Day:</strong>{" "}
                    {new Date(`${newDate}T00:00:00`).toLocaleDateString(
                      "en-US",
                      { weekday: "long" },
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">New Time</label>

                  <select
                    className="form-select"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  >
                    <option value="">Select Available Time</option>

                    {availableRescheduleSlots.map((slot, index) => (
                      <option key={`${slot}-${index}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRescheduleAppointment(null);
                    setNewDate("");
                    setNewTime("");
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReschedule}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyAppointments;
