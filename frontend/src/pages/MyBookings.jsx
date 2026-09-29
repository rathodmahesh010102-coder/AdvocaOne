import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
// NORMALIZE VALUE
// ========================================

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

// ========================================
// GET USER IDENTIFIER
// ========================================

function getUserIdentifier(user) {
  if (!user) {
    return "";
  }

  return normalizeValue(
    user.email ||
      user.userEmail ||
      user.id ||
      user.userId ||
      ""
  );
}

// ========================================
// CHECK WHETHER BOOKING BELONGS TO USER
// ========================================

function isBookingForUser(booking, user) {
  if (!booking || !user) {
    return false;
  }

  const loggedInEmail = normalizeValue(
    user.email ||
      user.userEmail ||
      ""
  );

  const loggedInId = normalizeValue(
    user.id ||
      user.userId ||
      ""
  );

  const bookingEmail = normalizeValue(
    booking.userEmail ||
      booking.clientEmail ||
      booking.email ||
      ""
  );

  const bookingClientId = normalizeValue(
    booking.clientId ||
      booking.userId ||
      booking.client?.id ||
      booking.client?.userId ||
      ""
  );

  const emailMatch = Boolean(
    loggedInEmail &&
      bookingEmail &&
      loggedInEmail === bookingEmail
  );

  const idMatch = Boolean(
    loggedInId &&
      bookingClientId &&
      loggedInId === bookingClientId
  );

  return emailMatch || idMatch;
}

// ========================================
// LOAD CURRENT CLIENT BOOKINGS
// ========================================

function loadClientBookings() {
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

  if (!loggedInUser) {
    return [];
  }

  const loggedInEmail = String(
    loggedInUser.email ||
      loggedInUser.userEmail ||
      ""
  )
    .trim()
    .toLowerCase();

  const loggedInId = String(
    loggedInUser.id ||
      loggedInUser.userId ||
      ""
  )
    .trim()
    .toLowerCase();

  return savedBookings.filter(
    (booking) => {
      const bookingEmail = String(
        booking.userEmail ||
          booking.clientEmail ||
          booking.email ||
          ""
      )
        .trim()
        .toLowerCase();

      const bookingClientId = String(
        booking.clientId ||
          booking.userId ||
          ""
      )
        .trim()
        .toLowerCase();

      const emailMatch =
        loggedInEmail &&
        bookingEmail &&
        loggedInEmail ===
          bookingEmail;

      const idMatch =
        loggedInId &&
        bookingClientId &&
        loggedInId ===
          bookingClientId;

      return emailMatch || idMatch;
    }
  );
}

// ========================================
// LOAD REVIEWS
// ========================================

function loadReviews() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "advocaOneReviews"
        ) || "[]"
      ) || []
    );
  } catch {
    return [];
  }
}

// ========================================
// LOAD CHATS
// ========================================

function loadChats() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "advocaOneChats"
        ) || "[]"
      ) || []
    );
  } catch {
    return [];
  }
}

// ========================================
// SAVE CHATS
// ========================================

function saveChats(chats) {
  localStorage.setItem(
    "advocaOneChats",
    JSON.stringify(chats)
  );

  window.dispatchEvent(
    new Event(
      "advocaOneDataUpdated"
    )
  );
}

// ========================================
// FORMAT DATE
// ========================================

function formatReviewDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "";
  }
}

// ========================================
// STAR COMPONENT
// ========================================

function StarRating({
  value,
  onChange,
  interactive = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              interactive &&
              onChange &&
              onChange(star)
            }
            disabled={!interactive}
            aria-label={`${star} star`}
            style={{
              border: "none",
              background:
                "transparent",
              padding: "2px",
              cursor: interactive
                ? "pointer"
                : "default",
              fontSize: interactive
                ? "30px"
                : "22px",
              lineHeight: 1,
              color:
                star <= value
                  ? "#f59e0b"
                  : "#cbd5e1",
              transition:
                "transform 0.15s ease",
            }}
            onMouseEnter={(
              event
            ) => {
              if (interactive) {
                event.currentTarget.style.transform =
                  "scale(1.15)";
              }
            }}
            onMouseLeave={(
              event
            ) => {
              if (interactive) {
                event.currentTarget.style.transform =
                  "scale(1)";
              }
            }}
          >
            ★
          </button>
        )
      )}
    </div>
  );
}

// ========================================
// COMPONENT
// ========================================

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState(loadClientBookings);

  const [reviews, setReviews] =
    useState(loadReviews);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const [
    reviewBooking,
    setReviewBooking,
  ] = useState(null);

  const [rating, setRating] =
    useState(5);

  const [
    reviewText,
    setReviewText,
  ] = useState("");

  const [
    reviewError,
    setReviewError,
  ] = useState("");

  const [
    reviewSuccess,
    setReviewSuccess,
  ] = useState("");

  // ========================================
  // REFRESH DATA
  // ========================================

  const refreshBookings = () => {
    setBookings(
      loadClientBookings()
    );

    setReviews(
      loadReviews()
    );
  };

  // ========================================
  // SYNC DATA
  // ========================================

  useEffect(() => {
    const handleDataUpdated =
      () => {
        refreshBookings();
      };

    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
          "advocaOneBookings" ||
        event.key ===
          "advocaOneReviews" ||
        event.key ===
          "advocaOneLoggedInUser"
      ) {
        refreshBookings();
      }
    };

    window.addEventListener(
      "advocaOneDataUpdated",
      handleDataUpdated
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    refreshBookings();

    return () => {
      window.removeEventListener(
        "advocaOneDataUpdated",
        handleDataUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // ========================================
  // LOGGED-IN USER
  // ========================================

  const loggedInUser =
    getLoggedInUser();

  const loggedInEmail =
    normalizeValue(
      loggedInUser?.email ||
        loggedInUser?.userEmail ||
        ""
    );

  // ========================================
  // REVIEW LOOKUP
  // ========================================

  const reviewMap = useMemo(() => {
    const map = {};

    reviews.forEach(
      (review) => {
        if (
          review.appointmentId
        ) {
          map[
            String(
              review.appointmentId
            )
          ] = review;
        }
      }
    );

    return map;
  }, [reviews]);

  // ========================================
  // CREATE / FIND CHAT
  // ========================================

  const createOrFindChat = (
    booking,
    currentUser
  ) => {
    if (
      !booking ||
      !currentUser
    ) {
      return null;
    }

    const clientIdentifier =
      getUserIdentifier(
        currentUser
      );

    const lawyerIdentifier =
      normalizeValue(
        booking.lawyerEmail ||
          booking.lawyer?.email ||
          booking.lawyerId ||
          booking.lawyerID ||
          booking.lawyer?.id ||
          ""
      );

    if (
      !clientIdentifier ||
      !lawyerIdentifier
    ) {
      return null;
    }

    const chats =
      loadChats();

    const existingIndex =
      chats.findIndex(
        (chat) => {
          const chatClient =
            normalizeValue(
              chat.clientId ||
                chat.clientEmail ||
                ""
            );

          const chatLawyer =
            normalizeValue(
              chat.lawyerId ||
                chat.lawyerEmail ||
                ""
            );

          return (
            chatClient ===
              clientIdentifier &&
            chatLawyer ===
              lawyerIdentifier
          );
        }
      );

    // ======================================
    // EXISTING CHAT
    // ======================================

    if (
      existingIndex >= 0
    ) {
      const existingChat =
        chats[
          existingIndex
        ];

      const appointmentIds =
        Array.isArray(
          existingChat.appointmentIds
        )
          ? [
              ...existingChat.appointmentIds,
            ]
          : [];

      if (
        booking.id &&
        !appointmentIds.some(
          (id) =>
            String(id) ===
            String(
              booking.id
            )
        )
      ) {
        appointmentIds.push(
          booking.id
        );
      }

      const updatedChat =
        {
          ...existingChat,

          clientId:
            existingChat.clientId ||
            clientIdentifier,

          clientEmail:
            currentUser.email ||
            existingChat.clientEmail ||
            booking.userEmail ||
            booking.clientEmail ||
            "",

          clientName:
            currentUser.name ||
            currentUser.fullName ||
            existingChat.clientName ||
            booking.userName ||
            "Client",

          lawyerId:
            existingChat.lawyerId ||
            lawyerIdentifier,

          lawyerEmail:
            booking.lawyerEmail ||
            existingChat.lawyerEmail ||
            "",

          lawyerName:
            booking.lawyerName ||
            existingChat.lawyerName ||
            "Lawyer",

          appointmentIds,

          lastBookingId:
            booking.id ||
            existingChat.lastBookingId ||
            "",

          updatedAt:
            new Date().toISOString(),
        };

      const updatedChats =
        chats.map(
          (
            chat,
            index
          ) =>
            index ===
            existingIndex
              ? updatedChat
              : chat
        );

      saveChats(
        updatedChats
      );

      return updatedChat.id;
    }

    // ======================================
    // CREATE NEW CHAT
    // ======================================

    const now =
      new Date().toISOString();

    const chatId =
      `chat_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const newChat = {
      id: chatId,

      clientId:
        clientIdentifier,

      clientName:
        currentUser.name ||
        currentUser.fullName ||
        booking.userName ||
        "Client",

      clientEmail:
        currentUser.email ||
        booking.userEmail ||
        booking.clientEmail ||
        "",

      lawyerId:
        lawyerIdentifier,

      lawyerName:
        booking.lawyerName ||
        "Lawyer",

      lawyerEmail:
        booking.lawyerEmail ||
        "",

      lawyerSpecialization:
        booking.specialization ||
        "",

      appointmentIds:
        booking.id
          ? [booking.id]
          : [],

      lastBookingId:
        booking.id || "",

      lastMessage:
        "Conversation started.",

      lastMessageAt:
        now,

      updatedAt:
        now,

      unreadFor: "",

      unreadCount: 0,

      createdAt:
        now,

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
            `You can now communicate with ${
              booking.lawyerName ||
              "your lawyer"
            } through AdvocaOne chat.`,

          timestamp:
            now,

          read: true,
        },
      ],
    };

    saveChats([
      ...chats,
      newChat,
    ]);

    return chatId;
  };

  // ========================================
  // OPEN CHAT WITH LAWYER
  // ========================================

  const handleChatWithLawyer = (
    booking
  ) => {
    const currentUser =
      getLoggedInUser();

    if (!currentUser) {
      alert(
        "Please login to chat with the lawyer."
      );

      navigate("/login");

      return;
    }

    const role =
      normalizeValue(
        currentUser.role ||
          "client"
      );

    if (
      role === "admin"
    ) {
      alert(
        "Admin accounts cannot start client-lawyer conversations from this page."
      );

      return;
    }

    const chatId =
      createOrFindChat(
        booking,
        currentUser
      );

    if (!chatId) {
      alert(
        "Unable to create the chat. Lawyer information is missing."
      );

      return;
    }

    navigate(
      `/chat?chat=${encodeURIComponent(
        chatId
      )}`
    );
  };

  // ========================================
  // OPEN PAYMENT
  // ========================================

  const handlePayment = (
    booking
  ) => {
    if (!booking) {
      return;
    }

    if (
      booking.status !==
      "Confirmed"
    ) {
      alert(
        "Payment is available only for confirmed appointments."
      );

      return;
    }

    navigate(
      "/payment",
      {
        state: {
          booking: {
            ...booking,

            // Keep both fields available
            consultationFee:
              booking.consultationFee ??
              booking.fee ??
              0,

            fee:
              booking.fee ??
              booking.consultationFee ??
              0,
          },
        },
      }
    );
  };

  // ========================================
  // SAVE REVIEWS
  // ========================================

  const saveReviews = (
    updatedReviews
  ) => {
    localStorage.setItem(
      "advocaOneReviews",
      JSON.stringify(
        updatedReviews
      )
    );

    setReviews(
      updatedReviews
    );

    window.dispatchEvent(
      new Event(
        "advocaOneDataUpdated"
      )
    );
  };

  // ========================================
  // OPEN REVIEW FORM
  // ========================================

  const openReviewForm = (
    booking
  ) => {
    const existingReview =
      reviewMap[
        String(
          booking.id
        )
      ];

    setReviewBooking(
      booking
    );

    setReviewError("");
    setReviewSuccess("");

    if (
      existingReview
    ) {
      setRating(
        existingReview.rating ||
          5
      );

      setReviewText(
        existingReview.comment ||
          ""
      );
    } else {
      setRating(5);
      setReviewText("");
    }
  };

  // ========================================
  // CLOSE REVIEW FORM
  // ========================================

  const closeReviewForm =
    () => {
      setReviewBooking(null);
      setReviewError("");
      setReviewSuccess("");
      setRating(5);
      setReviewText("");
    };

  // ========================================
  // SUBMIT REVIEW
  // ========================================

  const handleSubmitReview =
    () => {
      setReviewError("");
      setReviewSuccess("");

      if (
        !reviewBooking
      ) {
        return;
      }

      if (
        reviewBooking.status !==
        "Completed"
      ) {
        setReviewError(
          "You can review a lawyer only after the consultation is completed."
        );

        return;
      }

      if (
        !rating ||
        rating < 1 ||
        rating > 5
      ) {
        setReviewError(
          "Please select a rating from 1 to 5 stars."
        );

        return;
      }

      const cleanReview =
        reviewText.trim();

      if (
        !cleanReview
      ) {
        setReviewError(
          "Please write a review before submitting."
        );

        return;
      }

      if (
        cleanReview.length < 5
      ) {
        setReviewError(
          "Your review should contain at least 5 characters."
        );

        return;
      }

      if (
        cleanReview.length > 1000
      ) {
        setReviewError(
          "Your review cannot exceed 1000 characters."
        );

        return;
      }

      const latestReviews =
        loadReviews();

      const existingIndex =
        latestReviews.findIndex(
          (review) => {
            const sameAppointment =
              String(
                review.appointmentId
              ) ===
              String(
                reviewBooking.id
              );

            const reviewEmail =
              normalizeValue(
                review.clientEmail ||
                  ""
              );

            const reviewClientId =
              normalizeValue(
                review.clientId ||
                  ""
              );

            const currentClientId =
              normalizeValue(
                loggedInUser?.id ||
                  loggedInUser?.userId ||
                  ""
              );

            const sameClient =
              (
                loggedInEmail &&
                reviewEmail &&
                loggedInEmail ===
                  reviewEmail
              ) ||
              (
                currentClientId &&
                reviewClientId &&
                currentClientId ===
                  reviewClientId
              );

            return (
              sameAppointment &&
              sameClient
            );
          }
        );

      const lawyerId =
        reviewBooking.lawyerId ||
        reviewBooking.lawyerID ||
        reviewBooking.lawyer?.id ||
        "";

      const now =
        new Date().toISOString();

      const reviewData = {
        id:
          existingIndex >= 0
            ? latestReviews[
                existingIndex
              ].id
            : `review_${Date.now()}`,

        appointmentId:
          reviewBooking.id,

        lawyerId,

        lawyerName:
          reviewBooking.lawyerName ||
          "Lawyer",

        specialization:
          reviewBooking.specialization ||
          "",

        location:
          reviewBooking.location ||
          "",

        clientId:
          loggedInUser?.id ||
          loggedInUser?.userId ||
          "",

        clientName:
          loggedInUser?.name ||
          loggedInUser?.fullName ||
          reviewBooking.userName ||
          "Client",

        clientEmail:
          loggedInEmail,

        rating:
          Number(rating),

        comment:
          cleanReview,

        createdAt:
          existingIndex >= 0
            ? latestReviews[
                existingIndex
              ].createdAt ||
              now
            : now,

        updatedAt:
          now,
      };

      let updatedReviews;

      if (
        existingIndex >= 0
      ) {
        updatedReviews =
          latestReviews.map(
            (
              review,
              index
            ) =>
              index ===
              existingIndex
                ? {
                    ...review,
                    ...reviewData,
                  }
                : review
          );
      } else {
        updatedReviews = [
          ...latestReviews,
          reviewData,
        ];
      }

      saveReviews(
        updatedReviews
      );

      setReviewSuccess(
        existingIndex >= 0
          ? "Your review has been updated successfully."
          : "Thank you! Your review has been submitted successfully."
      );

      setTimeout(() => {
        closeReviewForm();
      }, 1200);
    };

  // ========================================
  // CANCEL BOOKING
  // ========================================

  const handleCancel = (
    id
  ) => {
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

    const currentUser =
      getLoggedInUser();

    if (!currentUser) {
      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }

    const updatedBookings =
      savedBookings.map(
        (booking) => {
          if (
            String(
              booking.id
            ) ===
              String(id) &&
            isBookingForUser(
              booking,
              currentUser
            )
          ) {
            return {
              ...booking,

              status:
                "Cancelled",

              updatedAt:
                new Date().toISOString(),
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
          isBookingForUser(
            booking,
            currentUser
          )
      )
    );

    window.dispatchEvent(
      new Event(
        "advocaOneDataUpdated"
      )
    );

    setSelectedBooking(
      null
    );
  };

  // ========================================
  // DELETE / REMOVE CANCELLED BOOKING
  // ========================================

  const handleDelete = (
    id
  ) => {
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

    const currentUser =
      getLoggedInUser();

    if (!currentUser) {
      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }

    const updatedBookings =
      savedBookings.filter(
        (booking) => {
          const isCurrentClient =
            isBookingForUser(
              booking,
              currentUser
            );

          const isSelectedBooking =
            String(
              booking.id
            ) === String(id);

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
          isBookingForUser(
            booking,
            currentUser
          )
      )
    );

    window.dispatchEvent(
      new Event(
        "advocaOneDataUpdated"
      )
    );

    setSelectedBooking(
      null
    );
  };

  // ========================================
  // REVIEW STATISTICS
  // ========================================

  const completedCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Completed"
    ).length;

  const reviewedCount =
    bookings.filter(
      (booking) =>
        booking.status ===
          "Completed" &&
        reviewMap[
          String(
            booking.id
          )
        ]
    ).length;

  // ========================================
  // RENDER
  // ========================================

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

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>

            <h1 className="fw-bold mb-2">
              My Consultations
            </h1>

            <p className="text-muted mb-0">
              View and manage your legal
              consultation appointments.
            </p>

          </div>

          {completedCount > 0 && (

            <div
              className="card shadow-sm border-0 px-4 py-3"
              style={{
                minWidth:
                  "220px",
              }}
            >

              <div
                className="text-muted"
                style={{
                  fontSize:
                    "13px",
                }}
              >
                ⭐ Reviews
              </div>

              <div className="fw-bold fs-5">
                {reviewedCount} /{" "}
                {completedCount}
              </div>

              <div
                className="text-muted"
                style={{
                  fontSize:
                    "12px",
                }}
              >
                Completed consultations reviewed
              </div>

            </div>

          )}

        </div>

        {/* ========================================
            NO BOOKINGS
        ======================================== */}

        {bookings.length ===
        0 ? (

          <div className="card shadow-sm p-5 text-center">

            <div
              style={{
                fontSize:
                  "60px",
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

          bookings.map(
            (booking) => {

              const existingReview =
                reviewMap[
                  String(
                    booking.id
                  )
                ];

              return (

                <div
                  className="card shadow-sm p-4 mb-4"
                  key={
                    booking.id
                  }
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
                        {booking.consultationFee ??
                          booking.fee ??
                          0}
                      </p>

                    </div>

                    {/* STATUS */}

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
                      EXISTING REVIEW
                  ======================================== */}

                  {existingReview && (

                    <div
                      className="mb-3 p-3 rounded"
                      style={{
                        background:
                          "#f8fafc",
                        border:
                          "1px solid #e2e8f0",
                      }}
                    >

                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                        <strong>
                          ⭐ Your Review
                        </strong>

                        <small className="text-muted">
                          {formatReviewDate(
                            existingReview.updatedAt ||
                              existingReview.createdAt
                          )}
                        </small>

                      </div>

                      <div className="mt-2">

                        <StarRating
                          value={
                            Number(
                              existingReview.rating
                            ) || 0
                          }
                        />

                      </div>

                      <p className="mb-0 mt-2">
                        {existingReview.comment}
                      </p>

                    </div>

                  )}

                  {/* ========================================
                      ACTIONS
                  ======================================== */}

                  <div className="d-flex gap-2 flex-wrap">

                    {/* VIEW */}

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

                    {/* CHAT */}

                    <button
                      className="btn btn-outline-success"
                      onClick={() =>
                        handleChatWithLawyer(
                          booking
                        )
                      }
                    >
                      💬 Chat with Lawyer
                    </button>

                    {/* ========================================
                        PAYMENT
                    ======================================== */}

                    {booking.status === "Confirmed" && (
  <>
    <button
      className="btn btn-primary"
      onClick={() => handlePayment(booking)}
    >
      💳 Pay Now
    </button>

    <button
      className="btn btn-success ms-2"
      onClick={() =>
        navigate("/video-consultation", {
          state: {
            appointment: booking,
          },
        })
      }
    >
      🎥 Join Video Consultation
    </button>
  </>
)}

                    {/* REVIEW */}

                    {booking.status ===
                      "Completed" && (

                      <button
                        className="btn btn-outline-warning"
                        onClick={() =>
                          openReviewForm(
                            booking
                          )
                        }
                      >
                        {existingReview
                          ? "✏️ Edit Review"
                          : "⭐ Rate Lawyer"}
                      </button>

                    )}

                    {/* CANCEL */}

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

                    {/* DELETE */}

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

              );
            }
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
              {selectedBooking.userName ||
                selectedBooking.clientName}
            </p>

            <p>
              <strong>
                📧 Email:
              </strong>{" "}
              {selectedBooking.userEmail ||
                selectedBooking.clientEmail}
            </p>

            <p>
              <strong>
                📱 Phone:
              </strong>{" "}
              {selectedBooking.userPhone ||
                selectedBooking.clientPhone}
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
              {selectedBooking.consultationFee ??
                selectedBooking.fee ??
                0}
            </p>

            <p>
              <strong>
                📌 Status:
              </strong>{" "}
              {selectedBooking.status ||
                "Pending"}
            </p>

            {/* ========================================
                CHAT ACTION
            ======================================== */}

            <hr />

            <div
              className="p-3 rounded mb-3"
              style={{
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
              }}
            >

              <div className="fw-bold mb-1">
                💬 Need to contact your lawyer?
              </div>

              <div
                className="text-muted"
                style={{
                  fontSize:
                    "14px",
                }}
              >
                Start or continue your private
                conversation with{" "}
                {selectedBooking.lawyerName ||
                  "your lawyer"}.
              </div>

            </div>

            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-success"
                onClick={() =>
                  handleChatWithLawyer(
                    selectedBooking
                  )
                }
              >
                💬 Chat with Lawyer
              </button>

              {/* PAYMENT FROM DETAILS */}

              {selectedBooking.status ===
                "Confirmed" && (

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handlePayment(
                      selectedBooking
                    )
                  }
                >
                  💳 Pay Now
                </button>

              )}

              {selectedBooking.status ===
                "Completed" && (

                <button
                  className="btn btn-outline-warning"
                  onClick={() => {
                    setSelectedBooking(
                      null
                    );

                    openReviewForm(
                      selectedBooking
                    );
                  }}
                >
                  {reviewMap[
                    String(
                      selectedBooking.id
                    )
                  ]
                    ? "✏️ Edit Review"
                    : "⭐ Rate Lawyer"}
                </button>

              )}

            </div>

            {/* REVIEW STATUS */}

            {selectedBooking.status ===
              "Completed" && (

              <>

                <hr />

                <p className="mb-0">

                  <strong>
                    ⭐ Review:
                  </strong>{" "}

                  {reviewMap[
                    String(
                      selectedBooking.id
                    )
                  ]
                    ? "Submitted"
                    : "Not submitted"}

                </p>

              </>

            )}

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

      {/* ==================================================
          REVIEW MODAL
      ================================================== */}

      {reviewBooking && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >

          <div
            className="card shadow-lg"
            style={{
              width: "100%",
              maxWidth:
                "560px",
              border: "none",
              borderRadius:
                "18px",
              overflow:
                "hidden",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  "20px 24px",
                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >

              <div className="d-flex justify-content-between align-items-start gap-3">

                <div>

                  <h3 className="fw-bold mb-1">
                    ⭐ Rate Your Lawyer
                  </h3>

                  <p className="text-muted mb-0">
                    {reviewBooking.lawyerName ||
                      "Lawyer"}
                  </p>

                </div>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={
                    closeReviewForm
                  }
                >
                  ✕
                </button>

              </div>

            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding:
                  "24px",
              }}
            >

              {/* RATING */}

              <div className="text-center mb-4">

                <label className="fw-bold d-block mb-2">
                  How was your consultation?
                </label>

                <StarRating
                  value={rating}
                  onChange={
                    setRating
                  }
                  interactive
                />

                <div
                  className="mt-2 fw-semibold"
                  style={{
                    color:
                      "#475569",
                  }}
                >
                  {rating === 5
                    ? "Excellent"
                    : rating === 4
                    ? "Very Good"
                    : rating === 3
                    ? "Good"
                    : rating === 2
                    ? "Needs Improvement"
                    : "Poor"}
                </div>

              </div>

              {/* REVIEW TEXT */}

              <div className="mb-3">

                <label
                  className="form-label fw-bold"
                  htmlFor="reviewText"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewText"
                  className="form-control"
                  rows="5"
                  maxLength="1000"
                  value={
                    reviewText
                  }
                  onChange={(
                    event
                  ) =>
                    setReviewText(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Share your experience with this lawyer..."
                />

                <div className="text-end text-muted mt-1">
                  {
                    reviewText.length
                  }
                  /1000
                </div>

              </div>

              {/* ERROR */}

              {reviewError && (

                <div className="alert alert-danger">
                  ❌{" "}
                  {reviewError}
                </div>

              )}

              {/* SUCCESS */}

              {reviewSuccess && (

                <div className="alert alert-success">
                  ✅{" "}
                  {reviewSuccess}
                </div>

              )}

              {/* ACTIONS */}

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={
                    closeReviewForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={
                    handleSubmitReview
                  }
                >
                  ⭐{" "}
                  {reviewMap[
                    String(
                      reviewBooking.id
                    )
                  ]
                    ? "Update Review"
                    : "Submit Review"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyBookings;