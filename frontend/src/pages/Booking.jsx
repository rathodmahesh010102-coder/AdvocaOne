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
    useState(selectedTimeFromProfile);

  const [selectedDay, setSelectedDay] =
    useState(selectedDayFromProfile);

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

  const [createdBooking, setCreatedBooking] =
    useState(null);

  const [createdChatId, setCreatedChatId] =
    useState("");

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
     GET LOGGED-IN CLIENT
  ===================================================== */

  const getLoggedInUser = () => {
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
  };

  /* =====================================================
     GET USER IDENTIFIER
  ===================================================== */

  const getUserIdentifier = (user) => {
    if (!user) return "";

    return String(
      user.email ||
        user.id ||
        user.userId ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  /* =====================================================
     CREATE / FIND CHAT CONVERSATION
  ===================================================== */

  const createOrFindChat = (
    booking,
    loggedInUser
  ) => {
    let chats = [];

    try {
      chats =
        JSON.parse(
          localStorage.getItem(
            "advocaOneChats"
          ) || "[]"
        ) || [];
    } catch {
      chats = [];
    }

    const clientIdentifier =
      getUserIdentifier(
        loggedInUser
      );

    const lawyerIdentifier =
      getUserIdentifier({
        email: lawyer.email,
        id: lawyer.id,
      });

    /*
      Find existing conversation between
      this client and lawyer.
    */

    const existingChatIndex =
      chats.findIndex((chat) => {
        const sameClient =
          String(chat.clientId || "")
            .trim()
            .toLowerCase() ===
          clientIdentifier;

        const sameLawyer =
          String(chat.lawyerId || "")
            .trim()
            .toLowerCase() ===
          lawyerIdentifier;

        return (
          sameClient &&
          sameLawyer
        );
      });

    /*
      If conversation already exists,
      attach the new appointment to it.
    */

    if (
      existingChatIndex !== -1
    ) {
      const existingChat =
        chats[existingChatIndex];

      const appointmentIds =
        Array.isArray(
          existingChat.appointmentIds
        )
          ? existingChat.appointmentIds
          : [];

      if (
        !appointmentIds.includes(
          String(booking.id)
        )
      ) {
        appointmentIds.push(
          String(booking.id)
        );
      }

      const updatedChat = {
        ...existingChat,

        appointmentIds,

        lastBookingId:
          String(booking.id),

        updatedAt:
          new Date().toISOString(),
      };

      chats[
        existingChatIndex
      ] = updatedChat;

      localStorage.setItem(
        "advocaOneChats",
        JSON.stringify(chats)
      );

      window.dispatchEvent(
        new Event(
          "advocaOneDataUpdated"
        )
      );

      return updatedChat.id;
    }

    /*
      Create new conversation.
    */

    const chatId =
      `chat_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const newChat = {
      id: chatId,

      clientId:
        clientIdentifier,

      clientName:
        loggedInUser?.name ||
        booking.userName,

      clientEmail:
        loggedInUser?.email ||
        booking.userEmail,

      lawyerId:
        lawyerIdentifier,

      lawyerName:
        lawyer.name,

      lawyerEmail:
        lawyer.email || "",

      lawyerSpecialization:
        lawyer.specialization ||
        "",

      appointmentIds: [
        String(booking.id),
      ],

      lastBookingId:
        String(booking.id),

      lastMessage:
        "Conversation started.",

      lastMessageAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

      unreadFor:
        "",

      unreadCount: 0,

      messages: [
        {
          id:
            `message_${Date.now()}`,

          senderId:
            "system",

          senderName:
            "AdvocaOne",

          senderRole:
            "system",

          text:
            `Your consultation booking with ${lawyer.name} has been created. You can use this chat to communicate with the lawyer.`,

          timestamp:
            new Date().toISOString(),

          read: true,
        },
      ],

      createdAt:
        new Date().toISOString(),
    };

    chats.push(newChat);

    localStorage.setItem(
      "advocaOneChats",
      JSON.stringify(chats)
    );

    window.dispatchEvent(
      new Event(
        "advocaOneDataUpdated"
      )
    );

    return chatId;
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
       GET LOGGED-IN USER
    ================================================= */

    const loggedInUser =
      getLoggedInUser();

    /*
      Use form data as fallback if the
      user object is not available.
    */

    const clientId =
      loggedInUser?.id ||
      loggedInUser?.userId ||
      loggedInUser?.email ||
      userEmail.trim();

    /* =================================================
       CREATE BOOKING
    ================================================= */

    const newBooking = {
      id: Date.now(),

      /* Lawyer identity */

      lawyerId:
        lawyer.id,

      lawyerName:
        lawyer.name,

      lawyerEmail:
        lawyer.email || "",

      specialization:
        lawyer.specialization,

      location:
        lawyer.location,

      /* Client identity */

      clientId,

      clientName:
        userName.trim(),

      clientEmail:
        userEmail.trim(),

      clientPhone:
        userPhone.trim(),

      /*
        Preserve old field names
        for existing application compatibility.
      */

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

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
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

    /* =================================================
       CREATE / CONNECT CHAT
    ================================================= */

    const chatId =
      createOrFindChat(
        newBooking,
        loggedInUser || {
          id: clientId,
          name: userName.trim(),
          email: userEmail.trim(),
        }
      );

    /* =================================================
       SAVE CREATED DATA FOR CONFIRMATION
    ================================================= */

    setCreatedBooking(
      newBooking
    );

    setCreatedChatId(
      chatId
    );

    setIsBooked(true);

    /* =================================================
       GLOBAL DATA UPDATE
    ================================================= */

    window.dispatchEvent(
      new Event(
        "advocaOneDataUpdated"
      )
    );
  };

  /* =====================================================
     OPEN CHAT
  ===================================================== */

  const handleOpenChat = () => {
    if (!createdChatId) {
      alert(
        "Chat conversation could not be opened."
      );

      return;
    }

    navigate(
      `/chat?chat=${encodeURIComponent(
        createdChatId
      )}`
    );
  };

  /* =====================================================
     BOOKING CONFIRMATION
  ===================================================== */

  if (isBooked) {
    const booking =
      createdBooking || {};

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
              ✅ Booking Created Successfully!
            </h3>

            <p className="confirmation-message">
              Your consultation request has been
              successfully submitted.
            </p>

            {/* Booking Status */}

            <div className="alert alert-warning">
              ⏳{" "}
              <strong>
                Status: Pending
              </strong>

              <br />

              The lawyer needs to confirm
              your appointment.
            </div>

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
              {booking.userName ||
                userName}
            </p>

            <p>
              <strong>
                Email:
              </strong>{" "}
              {booking.userEmail ||
                userEmail}
            </p>

            <p>
              <strong>
                Phone:
              </strong>{" "}
              {booking.userPhone ||
                userPhone}
            </p>

            <p className="appointment-detail">
              📅{" "}
              <strong>
                Date:
              </strong>{" "}
              {booking.date ||
                selectedDate}
            </p>

            {booking.day && (
              <p className="appointment-detail">
                🗓️{" "}
                <strong>
                  Day:
                </strong>{" "}
                {booking.day}
              </p>
            )}

            <p className="appointment-detail">
              🕐{" "}
              <strong>
                Time:
              </strong>{" "}
              {booking.time ||
                selectedTime}
            </p>

            <p>
              <strong>
                Consultation:
              </strong>{" "}
              {booking.consultationType ||
                consultationType}
            </p>

            <p>
              <strong>
                Fee:
              </strong>{" "}
              ₹
              {lawyer.consultationFee}
            </p>

            {/* =================================================
                CHAT INFORMATION
            ================================================= */}

            <div className="alert alert-info mt-4">
              💬{" "}
              <strong>
                Chat is now available
              </strong>

              <br />

              You can communicate with the lawyer
              through AdvocaOne chat.
            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

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
                className="btn btn-success"
                onClick={
                  handleOpenChat
                }
              >
                💬 Chat with Lawyer
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
                    ₹
                    {lawyer.consultationFee}
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
                    ₹
                    {lawyer.consultationFee}
                  </strong>

                </div>

              </div>

              {/* Chat Notice */}

              <div className="alert alert-info">

                💬 After submitting the booking,
                a chat conversation with this lawyer
                will be created automatically.

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