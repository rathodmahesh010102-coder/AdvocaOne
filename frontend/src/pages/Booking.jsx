import { useState } from "react";
import {
  useNavigate,
  useParams,
  Link,
  useSearchParams,
} from "react-router-dom";
import lawyers from "../data/lawyers";
import "../App.css";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedDayFromProfile =
    searchParams.get("day") || "";

  const selectedTimeFromProfile =
    searchParams.get("time") || "";

  /* =====================================================
     GET REGISTERED LAWYERS
  ===================================================== */

  const getRegisteredLawyers = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "advocaOneAdminLawyers"
          ) || "[]"
        ) || []
      );
    } catch {
      return [];
    }
  };

  const registeredLawyers =
    getRegisteredLawyers();

  /* =====================================================
     GET APPROVED REGISTERED LAWYERS
  ===================================================== */

  const approvedRegisteredLawyers =
    registeredLawyers
      .filter(
        (lawyer) =>
          String(lawyer.status)
            .trim()
            .toLowerCase() === "approved"
      )
      .map((lawyer) => ({
        ...lawyer,

        location:
          lawyer.city ||
          "Not Selected",

        consultationFee:
          lawyer.fee || 0,

        available: true,

        onlineStatus:
          lawyer.onlineStatus ||
          "Offline",

        appointmentStatus:
          lawyer.appointmentStatus ||
          "Accepting Appointments",

        nextAvailable:
          lawyer.nextAvailable ||
          "Contact for availability",

        slots:
          lawyer.slots || [],
      }));

  /* =====================================================
     GET ALL LAWYERS
  ===================================================== */

  const allLawyers = [
    ...lawyers,
    ...approvedRegisteredLawyers,
  ];

  const lawyer = allLawyers.find(
    (lawyerItem) =>
      String(lawyerItem.id) ===
      String(id)
  );

  /* =====================================================
     STATE
  ===================================================== */

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState(
      selectedTimeFromProfile
    );

  const [selectedDay, setSelectedDay] =
    useState(
      selectedDayFromProfile
    );

  const [userName, setUserName] =
    useState("");

  const [userEmail, setUserEmail] =
    useState("");

  const [userPhone, setUserPhone] =
    useState("");

  const [consultationType, setConsultationType] =
    useState("Online");

  const [reason, setReason] =
    useState("");

  const [isBooked, setIsBooked] =
    useState(false);

  /* =====================================================
     LAWYER NOT FOUND
  ===================================================== */

  if (!lawyer) {
    return (
      <div className="container py-5 text-center">

        <h2>
          Lawyer Not Found
        </h2>

        <Link
          to="/"
          className="btn btn-primary mt-3"
        >
          ← Back to Home
        </Link>

      </div>
    );
  }

  /* =====================================================
     CHECK IF LAWYER IS REGISTERED
  ===================================================== */

  const isRegisteredLawyer =
    registeredLawyers.some(
      (registeredLawyer) =>
        String(registeredLawyer.id) ===
        String(lawyer.id)
    );

  /* =====================================================
     GET LAWYER-SPECIFIC AVAILABILITY
  ===================================================== */

  const getAvailability = () => {
    /*
      Registered lawyers use their own
      lawyer-specific availability.
    */

    if (isRegisteredLawyer) {
      try {
        const allAvailabilities =
          JSON.parse(
            localStorage.getItem(
              "advocaOneAvailabilities"
            ) || "{}"
          ) || {};

        const lawyerEmail =
          lawyer.email
            ?.trim()
            .toLowerCase() || "";

        return (
          allAvailabilities[
            lawyerEmail
          ] || {}
        );
      } catch {
        return {};
      }
    }

    /*
      Demo/static lawyers continue using
      the old availability storage.
    */

    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "advocaOneAvailability"
          ) || "{}"
        ) || {}
      );
    } catch {
      return {};
    }
  };

  const availability =
    getAvailability();

  /* =====================================================
     AVAILABLE DAYS
  ===================================================== */

  const availableDays =
    Object.entries(
      availability
    ).filter(
      ([, slots]) =>
        Array.isArray(slots) &&
        slots.length > 0
    );

  /* =====================================================
     ALL AVAILABLE SLOTS
  ===================================================== */

  const allAvailableSlots = [
    ...new Set(
      availableDays.flatMap(
        ([, slots]) => slots
      )
    ),
  ];

  /* =====================================================
     HANDLE DAY CHANGE
  ===================================================== */

  const handleDayChange = (e) => {
    const day = e.target.value;

    setSelectedDay(day);
    setSelectedTime("");

    if (day) {
      const slots =
        availability[day] || [];

      if (slots.length > 0) {
        setSelectedTime(
          slots[0]
        );
      }
    }
  };

  /* =====================================================
     HANDLE BOOKING
  ===================================================== */

  const handleBooking = () => {
    if (
      !userName ||
      !userEmail ||
      !userPhone ||
      !selectedDate ||
      !selectedTime ||
      !reason
    ) {
      alert(
        "Please enter all required details and select a date and time."
      );
      return;
    }

    /* Validate email */

    if (
      !/^\S+@\S+\.\S+$/.test(
        userEmail
      )
    ) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    /* Validate phone */

    if (
      !/^[0-9]{10}$/.test(
        userPhone
      )
    ) {
      alert(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    /* Check appointment status */

    if (
      lawyer.appointmentStatus !==
      "Accepting Appointments"
    ) {
      alert(
        "This lawyer is currently not accepting appointments."
      );
      return;
    }

    /* =================================================
       GET EXISTING BOOKINGS
    ================================================= */

    let existingBookings = [];

    try {
      existingBookings =
        JSON.parse(
          localStorage.getItem(
            "advocaOneBookings"
          ) || "[]"
        ) || [];
    } catch {
      existingBookings = [];
    }

    /* =================================================
       DOUBLE BOOKING PROTECTION
    ================================================= */

    const isSlotBooked =
      existingBookings.some(
        (booking) =>
          String(
            booking.lawyerId
          ) ===
            String(lawyer.id) &&
          booking.date ===
            selectedDate &&
          booking.time ===
            selectedTime &&
          booking.status !==
            "Cancelled" &&
          booking.status !==
            "Rejected"
      );

    if (isSlotBooked) {
      alert(
        "⚠️ This time slot is already booked. Please select another time."
      );
      return;
    }

    /* =================================================
       CREATE BOOKING
    ================================================= */

    const newBooking = {
      id: Date.now(),

      /* Correct lawyer identity */

      lawyerId:
        lawyer.id,

      lawyerName:
        lawyer.name,

      specialization:
        lawyer.specialization,

      location:
        lawyer.location,

      /* Client information */

      userName:
        userName.trim(),

      userEmail:
        userEmail.trim(),

      userPhone:
        userPhone.trim(),

      /* Appointment information */

      date:
        selectedDate,

      day:
        selectedDay,

      time:
        selectedTime,

      consultationType,

      reason:
        reason.trim(),

      fee:
        Number(
          lawyer.consultationFee || 0
        ),

      status:
        "Pending",
    };

    /* =================================================
       SAVE BOOKING
    ================================================= */

    const updatedBookings = [
      ...existingBookings,
      newBooking,
    ];

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(
        updatedBookings
      )
    );

    setIsBooked(true);
  };

  /* =====================================================
     BOOKING CONFIRMATION
  ===================================================== */

  if (isBooked) {
    return (
      <div className="booking-page">

        <nav className="navbar navbar-dark bg-dark">

          <div className="container">

            <Link
              to="/"
              className="navbar-brand fw-bold"
            >
              ⚖️ AdvocaOne
            </Link>

          </div>

        </nav>

        <div className="container py-5">

          <div className="booking-confirmation">

            <h3>
              ✅ Booking Confirmed!
            </h3>

            <p className="confirmation-message">
              Your consultation has been
              successfully booked.
            </p>

            <p>
              <strong>
                Lawyer:
              </strong>{" "}
              {lawyer.name}
            </p>

            <p>
              <strong>
                Practice Area:
              </strong>{" "}
              {lawyer.specialization}
            </p>

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
              {userEmail}
            </p>

            <p>
              <strong>
                Phone:
              </strong>{" "}
              {userPhone}
            </p>

            <p className="appointment-detail">
              📅{" "}
              <strong>
                Date:
              </strong>{" "}
              {selectedDate}
            </p>

            {selectedDay && (
              <p className="appointment-detail">
                🗓️{" "}
                <strong>
                  Day:
                </strong>{" "}
                {selectedDay}
              </p>
            )}

            <p className="appointment-detail">
              🕐{" "}
              <strong>
                Time:
              </strong>{" "}
              {selectedTime}
            </p>

            <p>
              <strong>
                Consultation:
              </strong>{" "}
              {consultationType}
            </p>

            <p>
              <strong>
                Fee:
              </strong>{" "}
              ₹{lawyer.consultationFee}
            </p>

            <div className="confirmation-buttons">

              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate(
                    "/my-bookings"
                  )
                }
              >
                📋 My Bookings
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  navigate("/")
                }
              >
                ⚖️ Find Another Lawyer
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     BOOKING FORM
  ===================================================== */

  return (
    <div className="booking-page">

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <Link
            to={`/lawyer/${lawyer.id}`}
            className="btn btn-outline-light"
          >
            ← Lawyer Profile
          </Link>

        </div>

      </nav>

      <div className="container py-5">

        <h1 className="text-center fw-bold">
          BOOK CONSULTATION
        </h1>

        <p className="text-center text-muted">
          Schedule a consultation with
          your selected lawyer.
        </p>

        <div className="row justify-content-center mt-4">

          <div className="col-lg-8">

            <div className="card shadow p-4">

              {/* Lawyer Information */}

              <div className="text-center mb-4">

                <div className="lawyer-profile-avatar">
                  ⚖️
                </div>

                <h3 className="fw-bold mt-3">
                  {lawyer.name}
                </h3>

                <p className="text-primary">
                  {lawyer.specialization}
                </p>

                <p className="text-muted">
                  📍 {lawyer.location}
                </p>

              </div>

              {/* Experience and Fee */}

              <div className="alert alert-light border">

                <div className="d-flex justify-content-between flex-wrap gap-2">

                  <span>
                    💼{" "}
                    <strong>
                      Experience:
                    </strong>{" "}
                    {lawyer.experience} years
                  </span>

                  <span>
                    💰{" "}
                    <strong>
                      Fee:
                    </strong>{" "}
                    ₹{lawyer.consultationFee}
                  </span>

                </div>

              </div>

              {/* Appointment Status */}

              {lawyer.appointmentStatus !==
                "Accepting Appointments" && (

                <div className="alert alert-warning">

                  ⚠️ This lawyer is currently{" "}

                  <strong>
                    {lawyer.appointmentStatus}
                  </strong>{" "}

                  and is not accepting new
                  appointments.

                </div>

              )}

              <hr />

              {/* Client Details */}

              <h5 className="fw-bold">
                👤 Your Details
              </h5>

              <label className="form-label mt-3">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                value={userName}
                onChange={(e) =>
                  setUserName(
                    e.target.value
                  )
                }
              />

              <label className="form-label mt-3">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) =>
                  setUserEmail(
                    e.target.value
                  )
                }
              />

              <label className="form-label mt-3">
                Phone Number
              </label>

              <input
                type="tel"
                className="form-control"
                placeholder="Enter 10-digit phone number"
                value={userPhone}
                onChange={(e) =>
                  setUserPhone(
                    e.target.value
                  )
                }
              />

              <hr className="my-4" />

              {/* Appointment Details */}

              <h5 className="fw-bold">
                📅 Appointment Details
              </h5>

              {/* Day */}

              <label className="form-label mt-3">
                Select Day
              </label>

              <select
                className="form-select"
                value={selectedDay}
                onChange={
                  handleDayChange
                }
                disabled={
                  lawyer.appointmentStatus !==
                  "Accepting Appointments"
                }
              >

                <option value="">
                  Select Available Day
                </option>

                {availableDays.map(
                  ([day, slots]) => (

                    <option
                      key={day}
                      value={day}
                    >
                      {day} ({slots.length} slots)
                    </option>

                  )
                )}

              </select>

              {selectedDayFromProfile && (

                <div className="alert alert-success mt-3">

                  🗓️{" "}
                  <strong>
                    Selected Day:
                  </strong>{" "}
                  {selectedDayFromProfile}

                </div>

              )}

              {/* Date */}

              <label className="form-label mt-3">
                Select Date
              </label>

              <input
                type="date"
                className="form-control"
                value={selectedDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
              />

              {/* Time */}

              <label className="form-label mt-3">
                Select Available Time
              </label>

              <select
                className="form-select"
                value={selectedTime}
                onChange={(e) =>
                  setSelectedTime(
                    e.target.value
                  )
                }
                disabled={
                  lawyer.appointmentStatus !==
                    "Accepting Appointments" ||
                  !selectedDay
                }
              >

                <option value="">
                  Select Available Time
                </option>

                {selectedDay &&
                  (
                    availability[
                      selectedDay
                    ] || []
                  ).map(
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

              {!selectedDay &&
                allAvailableSlots.length > 0 && (

                  <small className="text-muted mt-2">

                    Please select a day to
                    see available time slots.

                  </small>

                )}

              {availableDays.length === 0 && (

                <div className="alert alert-warning mt-3">

                  ⚠️ No availability slots
                  have been configured by
                  this lawyer yet.

                </div>

              )}

              {/* Consultation Type */}

              <label className="form-label mt-3">
                Consultation Type
              </label>

              <select
                className="form-select"
                value={consultationType}
                onChange={(e) =>
                  setConsultationType(
                    e.target.value
                  )
                }
              >

                <option value="Online">
                  💻 Online Consultation
                </option>

                <option value="In-Person">
                  🏢 In-Person Consultation
                </option>

              </select>

              {/* Reason */}

              <label className="form-label mt-3">
                Reason for Consultation
              </label>

              <textarea
                className="form-control"
                rows="4"
                placeholder="Briefly describe your legal issue..."
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
              />

              {/* Fee */}

              <div className="alert alert-primary mt-4">

                <div className="d-flex justify-content-between">

                  <span>
                    Consultation Fee
                  </span>

                  <strong>
                    ₹{lawyer.consultationFee}
                  </strong>

                </div>

              </div>

              {/* Confirm Booking */}

              <button
                className="btn btn-primary btn-lg w-100 mt-2"
                onClick={
                  handleBooking
                }
                disabled={
                  lawyer.appointmentStatus !==
                    "Accepting Appointments" ||
                  !selectedDay ||
                  !selectedTime
                }
              >
                📅 Confirm Booking
              </button>

              <Link
                to={`/lawyer/${lawyer.id}`}
                className="btn btn-outline-secondary w-100 mt-2"
              >
                ← Back to Lawyer Profile
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Booking;