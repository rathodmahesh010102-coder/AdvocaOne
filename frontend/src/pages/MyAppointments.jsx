import { useEffect, useState } from "react";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Get logged-in client
  const getLoggedInUser = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("advocaOneLoggedInUser") || "null"
        ) || null
      );
    } catch {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const loggedInEmail =
    loggedInUser?.email?.trim().toLowerCase() || "";

  // Get registered lawyers
  const getRegisteredLawyers = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("advocaOneAdminLawyers") || "[]"
        ) || []
      );
    } catch {
      return [];
    }
  };

  // Find lawyer email using appointment details
  const getLawyerEmail = (appointment) => {
    if (appointment?.lawyerEmail) {
      return appointment.lawyerEmail.trim().toLowerCase();
    }

    const lawyers = getRegisteredLawyers();

    const lawyer = lawyers.find((item) => {
      const sameId =
        String(item.id || "").trim() ===
        String(appointment?.lawyerId || "").trim();

      const sameName =
        item.name?.trim().toLowerCase() ===
        appointment?.lawyerName?.trim().toLowerCase();

      return sameId || sameName;
    });

    return lawyer?.email?.trim().toLowerCase() || "";
  };

  // Get availability for selected lawyer
  const getLawyerAvailability = (appointment) => {
    const lawyerEmail = getLawyerEmail(appointment);

    // Registered lawyers use lawyer-specific availability
    if (lawyerEmail) {
      try {
        const allAvailabilities =
          JSON.parse(
            localStorage.getItem("advocaOneAvailabilities") || "{}"
          ) || {};

        if (allAvailabilities[lawyerEmail]) {
          return allAvailabilities[lawyerEmail];
        }
      } catch {
        // Use fallback below
      }
    }

    // Static/demo lawyers use old availability
    try {
      return (
        JSON.parse(
          localStorage.getItem("advocaOneAvailability") || "{}"
        ) || {}
      );
    } catch {
      return {};
    }
  };

  // Selected reschedule day
  const selectedRescheduleDay = newDate
    ? new Date(`${newDate}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      )
    : "";

  // Availability for selected lawyer
  const availability = getLawyerAvailability(
    rescheduleAppointment
  );

  const availableRescheduleSlots =
    availability[selectedRescheduleDay] || [];

  // Load only current client's appointments
  const loadAppointments = () => {
    try {
      const bookings =
        JSON.parse(
          localStorage.getItem("advocaOneBookings") || "[]"
        ) || [];

      // Automatically mark old confirmed appointments as completed
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedBookings = bookings.map((booking) => {
        const bookingEmail =
          booking.userEmail?.trim().toLowerCase() || "";

        if (
          bookingEmail === loggedInEmail &&
          booking.status === "Confirmed" &&
          booking.date
        ) {
          const appointmentDate = new Date(
            `${booking.date}T00:00:00`
          );

          if (appointmentDate < today) {
            return {
              ...booking,
              status: "Completed",
            };
          }
        }

        return booking;
      });

      // Save updated bookings
      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(updatedBookings)
      );

      // Show only current client's appointments
      const clientBookings = updatedBookings.filter(
        (booking) => {
          const bookingEmail =
            booking.userEmail?.trim().toLowerCase() || "";

          return (
            loggedInEmail &&
            bookingEmail &&
            bookingEmail === loggedInEmail
          );
        }
      );

      setAppointments(clientBookings);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
    }
  };

  // Cancel Appointment
  const handleCancel = (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const bookings =
        JSON.parse(
          localStorage.getItem("advocaOneBookings") || "[]"
        ) || [];

      const updatedBookings = bookings.map((booking) => {
        const bookingEmail =
          booking.userEmail?.trim().toLowerCase() || "";

        // Update only current client's appointment
        if (
          String(booking.id) === String(id) &&
          bookingEmail === loggedInEmail
        ) {
          return {
            ...booking,
            status: "Cancelled",
          };
        }

        return booking;
      });

      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(updatedBookings)
      );

      // Refresh current client's appointments
      setAppointments(
        updatedBookings.filter((booking) => {
          const bookingEmail =
            booking.userEmail?.trim().toLowerCase() || "";

          return bookingEmail === loggedInEmail;
        })
      );

      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Unable to cancel appointment.");
    }
  };

  // Reschedule Appointment
  const handleReschedule = () => {
    if (!rescheduleAppointment) {
      return;
    }

    // Same date and time
    if (
      newDate === rescheduleAppointment.date &&
      newTime === rescheduleAppointment.time
    ) {
      alert("Please select a different date or time.");
      return;
    }

    // Cancelled appointment
    if (rescheduleAppointment.status === "Cancelled") {
      alert("Cancelled appointments cannot be rescheduled.");
      return;
    }

    // Completed appointment
    if (rescheduleAppointment.status === "Completed") {
      alert("Completed appointments cannot be rescheduled.");
      return;
    }

    // Required fields
    if (!newDate || !newTime) {
      alert("Please select a new date and time.");
      return;
    }

    // Selected day
    const selectedDay = new Date(
      `${newDate}T00:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Get lawyer availability
    const lawyerAvailability = getLawyerAvailability(
      rescheduleAppointment
    );

    const availableSlots =
      lawyerAvailability[selectedDay] || [];

    // Check available slot
    if (!availableSlots.includes(newTime)) {
      alert(
        `⚠️ ${selectedDay} at ${newTime} is not available for this lawyer. Please select an available time slot.`
      );
      return;
    }

    // Check today's time
    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (newDate === today) {
      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      const [time, period] = newTime.split(" ");

      let [hours, minutes] = time
        .split(":")
        .map(Number);

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      const selectedMinutes =
        hours * 60 + minutes;

      if (selectedMinutes <= currentMinutes) {
        alert("Please select a future time.");
        return;
      }
    }

    try {
      const existingBookings =
        JSON.parse(
          localStorage.getItem("advocaOneBookings") || "[]"
        ) || [];

      // Check double booking
      const isSlotBooked = existingBookings.some(
        (booking) =>
          String(booking.lawyerId) ===
            String(rescheduleAppointment.lawyerId) &&
          booking.date === newDate &&
          booking.time === newTime &&
          String(booking.id) !==
            String(rescheduleAppointment.id) &&
          booking.status !== "Cancelled" &&
          booking.status !== "Rejected"
      );

      if (isSlotBooked) {
        alert(
          "⚠️ This time slot is already booked. Please select another time."
        );
        return;
      }

      // Update only current client's appointment
      const updatedBookings = existingBookings.map(
        (booking) => {
          const bookingEmail =
            booking.userEmail?.trim().toLowerCase() || "";

          if (
            String(booking.id) ===
              String(rescheduleAppointment.id) &&
            bookingEmail === loggedInEmail
          ) {
            return {
              ...booking,
              lawyerEmail:
                booking.lawyerEmail ||
                getLawyerEmail(rescheduleAppointment),
              date: newDate,
              day: selectedDay,
              time: newTime,
              status: "Pending",
            };
          }

          return booking;
        }
      );

      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(updatedBookings)
      );

      // Update current client's appointments
      const updatedClientAppointments =
        updatedBookings.filter((booking) => {
          const bookingEmail =
            booking.userEmail?.trim().toLowerCase() || "";

          return bookingEmail === loggedInEmail;
        });

      setAppointments(updatedClientAppointments);

      // Close modal
      setRescheduleAppointment(null);
      setNewDate("");
      setNewTime("");

      alert(
        "Appointment rescheduled successfully!\nYour new appointment is pending confirmation."
      );
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      alert("Unable to reschedule appointment.");
    }
  };

  // Load appointments when page opens
  useEffect(() => {
    loadAppointments();
  }, []);

  // Total
  const totalCount = appointments.length;

  // Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upcoming
  const upcomingAppointments = appointments.filter(
    (appointment) => {
      if (!appointment.date) {
        return false;
      }

      const appointmentDate = new Date(
        `${appointment.date}T00:00:00`
      );

      return (
        appointmentDate >= today &&
        appointment.status !== "Cancelled"
      );
    }
  );

  // Past
  const pastAppointments = appointments.filter(
    (appointment) => {
      if (!appointment.date) {
        return false;
      }

      const appointmentDate = new Date(
        `${appointment.date}T00:00:00`
      );

      return appointmentDate < today;
    }
  );

  // Status counts
  const pendingCount = appointments.filter(
    (appointment) =>
      appointment.status === "Pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) =>
      appointment.status === "Confirmed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) =>
      appointment.status === "Cancelled"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "Completed"
  ).length;

  // Filter + Search
  const filteredAppointments = appointments.filter(
    (appointment) => {
      const matchesFilter =
        filter === "All" ||
        appointment.status === filter ||
        (filter === "Upcoming" &&
          upcomingAppointments.some(
            (item) => item.id === appointment.id
          )) ||
        (filter === "Past" &&
          pastAppointments.some(
            (item) => item.id === appointment.id
          ));

      const searchText = search.toLowerCase();

      const matchesSearch =
        appointment.lawyerName
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.specialization
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.location
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.reason
          ?.toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    }
  );

  return (
    <>
      <div className="container mt-5 pt-5">

        {/* Page Header */}
        <h2 className="mb-2">
          My Appointments
        </h2>

        <p className="text-muted mb-4">
          View and manage your legal consultation
          appointments.
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
                filter === status
                  ? "btn-primary"
                  : "btn-outline-primary"
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

            <div style={{ fontSize: "50px" }}>
              📅
            </div>

            <h4 className="mt-3">
              No Appointments Found
            </h4>

            <p className="text-muted">
              You don't have any appointments yet.
            </p>

          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-5">

            <div style={{ fontSize: "50px" }}>
              🔍
            </div>

            <h4 className="mt-3">
              No Matching Appointments
            </h4>

            <p className="text-muted">
              Try changing your search or filter.
            </p>

          </div>
        ) : (
          <div className="row">

            {filteredAppointments.map(
              (appointment) => (
                <div
                  className="col-md-6 col-lg-4 mb-4"
                  key={appointment.id}
                >

                  <div className="card shadow-sm h-100">

                    <div className="card-body">

                      {/* Lawyer */}
                      <h5 className="card-title">
                        {appointment.lawyerName}
                      </h5>

                      {/* Status */}
                      <span
                        className={`badge ${
                          appointment.status ===
                          "Confirmed"
                            ? "bg-success"
                            : appointment.status ===
                              "Completed"
                            ? "bg-primary"
                            : appointment.status ===
                              "Cancelled"
                            ? "bg-danger"
                            : appointment.status ===
                              "Rejected"
                            ? "bg-secondary"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {appointment.status ||
                          "Pending"}
                      </span>

                      {/* Appointment ID */}
                      <small className="text-muted d-block mb-3">
                        Appointment ID:{" "}
                        {appointment.id}
                      </small>

                      {/* Specialization */}
                      <p className="mb-2">
                        <strong>
                          Specialization:
                        </strong>{" "}
                        {appointment.specialization ||
                          "Not specified"}
                      </p>

                      {/* Location */}
                      <p className="mb-2">
                        <strong>
                          Location:
                        </strong>{" "}
                        {appointment.location ||
                          "Not specified"}
                      </p>

                      {/* Date */}
                      <p className="mb-2">
                        <strong>Date:</strong>{" "}
                        {appointment.date ||
                          "Not specified"}
                      </p>

                      {/* Time */}
                      <p className="mb-2">
                        <strong>Time:</strong>{" "}
                        {appointment.time ||
                          "Not specified"}
                      </p>

                      {/* Reason */}
                      <p className="mb-2">
                        <strong>Reason:</strong>{" "}
                        {appointment.reason ||
                          "Not specified"}
                      </p>

                      {/* Fee */}
                      <p className="mb-3">
                        <strong>Fee:</strong> ₹
                        {appointment.fee || 0}
                      </p>

                      {/* Cancel */}
                      {appointment.status !==
                        "Cancelled" &&
                        appointment.status !==
                          "Completed" && (
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() =>
                              handleCancel(
                                appointment.id
                              )
                            }
                          >
                            Cancel Appointment
                          </button>
                        )}

                      {/* View Details */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setSelectedAppointment(
                            appointment
                          )
                        }
                      >
                        View Details
                      </button>

                      {/* Reschedule */}
                      {appointment.status !==
                        "Cancelled" &&
                        appointment.status !==
                          "Completed" &&
                        !pastAppointments.some(
                          (item) =>
                            item.id ===
                            appointment.id
                        ) && (
                          <button
                            className="btn btn-warning btn-sm ms-2"
                            onClick={() => {
                              setRescheduleAppointment(
                                appointment
                              );

                              setNewDate(
                                appointment.date || ""
                              );

                              setNewTime(
                                appointment.time || ""
                              );
                            }}
                          >
                            Reschedule
                          </button>
                        )}

                    </div>
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Appointment Details
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                ></button>

              </div>

              <div className="modal-body">

                <p>
                  <strong>Lawyer:</strong>{" "}
                  {selectedAppointment.lawyerName}
                </p>

                <p>
                  <strong>
                    Specialization:
                  </strong>{" "}
                  {selectedAppointment.specialization ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedAppointment.location ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {selectedAppointment.date ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {selectedAppointment.time ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {selectedAppointment.reason ||
                    "Not specified"}
                </p>

                <p>
                  <strong>
                    Consultation Fee:
                  </strong>{" "}
                  ₹{selectedAppointment.fee || 0}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      selectedAppointment.status ===
                      "Confirmed"
                        ? "bg-success"
                        : selectedAppointment.status ===
                          "Completed"
                        ? "bg-primary"
                        : selectedAppointment.status ===
                          "Cancelled"
                        ? "bg-danger"
                        : selectedAppointment.status ===
                          "Rejected"
                        ? "bg-secondary"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {selectedAppointment.status ||
                      "Pending"}
                  </span>
                </p>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
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
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Reschedule Appointment
                </h5>

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

              <div className="modal-body">

                <p>
                  <strong>Lawyer:</strong>{" "}
                  {rescheduleAppointment.lawyerName}
                </p>

                <div className="mb-3">

                  <label className="form-label">
                    New Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    value={newDate}
                    onChange={(e) => {
                      setNewDate(e.target.value);
                      setNewTime("");
                    }}
                  />

                </div>

                {newDate && (
                  <div className="alert alert-info">

                    🗓️{" "}
                    <strong>
                      Selected Day:
                    </strong>{" "}
                    {new Date(
                      `${newDate}T00:00:00`
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                      }
                    )}

                  </div>
                )}

                <div className="mb-3">

                  <label className="form-label">
                    New Time
                  </label>

                  <select
                    className="form-select"
                    value={newTime}
                    onChange={(e) =>
                      setNewTime(e.target.value)
                    }
                    disabled={!newDate}
                  >

                    <option value="">
                      Select Available Time
                    </option>

                    {availableRescheduleSlots.map(
                      (slot, index) => (
                        <option
                          key={`${slot}-${index}`}
                          value={slot}
                        >
                          {slot}
                        </option>
                      )
                    )}

                  </select>

                  {newDate &&
                    availableRescheduleSlots.length ===
                      0 && (
                      <small className="text-danger">
                        No available slots for this day.
                      </small>
                    )}

                </div>

              </div>

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