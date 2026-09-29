import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import lawyers from "../data/lawyers";
import "../App.css";

function LawyerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registeredLawyers, setRegisteredLawyers] = useState([]);
  const [lawyerAvailabilities, setLawyerAvailabilities] = useState({});
  const [globalAvailability, setGlobalAvailability] = useState({});
  const [reviews, setReviews] = useState([]);

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    const loadData = () => {
      // Registered Lawyers
      try {
        const savedLawyers = JSON.parse(
          localStorage.getItem("advocaOneAdminLawyers") || "[]"
        ) || [];

        setRegisteredLawyers(
          Array.isArray(savedLawyers) ? savedLawyers : []
        );
      } catch (error) {
        console.error("Error loading registered lawyers:", error);
        setRegisteredLawyers([]);
      }

      // Lawyer Availability
      try {
        const savedLawyerAvailability = JSON.parse(
          localStorage.getItem("advocaOneAvailabilities") || "{}"
        ) || {};

        setLawyerAvailabilities(savedLawyerAvailability);
      } catch (error) {
        console.error("Error loading lawyer availability:", error);
        setLawyerAvailabilities({});
      }

      // Global Availability
      try {
        const savedGlobalAvailability = JSON.parse(
          localStorage.getItem("advocaOneAvailability") || "{}"
        ) || {};

        setGlobalAvailability(savedGlobalAvailability);
      } catch (error) {
        console.error("Error loading global availability:", error);
        setGlobalAvailability({});
      }

      // Reviews
      try {
        const savedReviews = JSON.parse(
          localStorage.getItem("advocaOneReviews") || "[]"
        ) || [];

        setReviews(
          Array.isArray(savedReviews) ? savedReviews : []
        );
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      }
    };

    loadData();

    const handleStorageChange = (event) => {
      if (
        event.key === "advocaOneReviews" ||
        event.key === "advocaOneAdminLawyers" ||
        event.key === "advocaOneAvailabilities" ||
        event.key === "advocaOneAvailability"
      ) {
        loadData();
      }
    };

    const handleAdvocaOneUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "advocaOneDataUpdated",
      handleAdvocaOneUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "advocaOneDataUpdated",
        handleAdvocaOneUpdate
      );
    };
  }, []);

  // =========================================================
  // FIND REGISTERED LAWYER
  // =========================================================

  const registeredLawyer = registeredLawyers.find(
    (registeredLawyer) =>
      String(registeredLawyer.id) === String(id)
  );

  // =========================================================
  // FIND STATIC LAWYER
  // =========================================================

  const staticLawyer = lawyers.find(
    (lawyer) =>
      String(lawyer.id) === String(id)
  );

  // =========================================================
  // DETERMINE CURRENT LAWYER
  // =========================================================

  const lawyer = registeredLawyer
    ? {
        ...registeredLawyer,

        location:
          registeredLawyer.city &&
          registeredLawyer.city !== "Not Selected"
            ? registeredLawyer.city
            : "Not specified",

        consultationFee:
          Number(registeredLawyer.fee) || 0,

        experience:
          Number(registeredLawyer.experience) || 0,

        onlineStatus:
          registeredLawyer.onlineStatus || "Offline",

        appointmentStatus:
          registeredLawyer.appointmentStatus ||
          "Accepting Appointments",

        nextAvailable:
          registeredLawyer.nextAvailable ||
          "Contact for availability",
      }
    : staticLawyer;

  // =========================================================
  // REGISTERED LAWYER CHECK
  // =========================================================

  const isRegisteredLawyer = Boolean(
    registeredLawyer
  );

  // =========================================================
  // GET CORRECT AVAILABILITY
  // =========================================================

  const lawyerAvailability = isRegisteredLawyer
    ? registeredLawyer?.email
      ? lawyerAvailabilities[
          registeredLawyer.email
            .trim()
            .toLowerCase()
        ] || {}
      : {}
    : globalAvailability;

  // =========================================================
  // CHECK AVAILABLE SLOTS
  // =========================================================

  const hasAvailableSlots = (availability) => {
    if (!availability) {
      return false;
    }

    return Object.values(availability).some(
      (slots) =>
        Array.isArray(slots) &&
        slots.length > 0
    );
  };

  // =========================================================
  // AVAILABILITY
  // =========================================================

  const lawyerIsAvailable =
    hasAvailableSlots(lawyerAvailability);

  // =========================================================
  // AVAILABLE DAYS
  // =========================================================

  const availableDays = Object.entries(
    lawyerAvailability || {}
  ).filter(
    ([, slots]) =>
      Array.isArray(slots) &&
      slots.length > 0
  );

  // =========================================================
  // REVIEWS FOR CURRENT LAWYER
  // IMPORTANT:
  // HOOK MUST BE BEFORE ANY CONDITIONAL RETURN
  // =========================================================

  const lawyerReviews = useMemo(() => {
    if (!lawyer) {
      return [];
    }

    return reviews
      .filter((review) => {
        const reviewLawyerId =
          review?.lawyerId !== undefined &&
          review?.lawyerId !== null
            ? String(review.lawyerId)
            : "";

        const currentLawyerId =
          lawyer?.id !== undefined &&
          lawyer?.id !== null
            ? String(lawyer.id)
            : "";

        // Match by lawyer ID
        if (
          reviewLawyerId &&
          currentLawyerId &&
          reviewLawyerId === currentLawyerId
        ) {
          return true;
        }

        // Fallback match by lawyer name
        const reviewLawyerName =
          String(review?.lawyerName || "")
            .trim()
            .toLowerCase();

        const currentLawyerName =
          String(lawyer?.name || "")
            .trim()
            .toLowerCase();

        return (
          reviewLawyerName &&
          currentLawyerName &&
          reviewLawyerName === currentLawyerName
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a?.createdAt ||
            a?.updatedAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.createdAt ||
            b?.updatedAt ||
            0
        ).getTime();

        return dateB - dateA;
      });
  }, [reviews, lawyer]);

  // =========================================================
  // REVIEW COUNT
  // =========================================================

  const reviewCount =
    lawyerReviews.length;

  // =========================================================
  // AVERAGE RATING
  // IMPORTANT:
  // HOOK MUST ALWAYS RUN
  // =========================================================

  const averageRating = useMemo(() => {
    if (lawyerReviews.length === 0) {
      return 0;
    }

    const total =
      lawyerReviews.reduce(
        (sum, review) =>
          sum +
          (Number(review.rating) || 0),
        0
      );

    return total / lawyerReviews.length;
  }, [lawyerReviews]);

  // =========================================================
  // ROUNDED RATING
  // =========================================================

  const roundedRating =
    Math.round(averageRating);

  // =========================================================
  // RATING DISTRIBUTION
  // =========================================================

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map(
      (rating) => {
        const count =
          lawyerReviews.filter(
            (review) =>
              Number(review.rating) ===
              rating
          ).length;

        const percentage =
          reviewCount > 0
            ? Math.round(
                (count / reviewCount) *
                  100
              )
            : 0;

        return {
          rating,
          count,
          percentage,
        };
      }
    );
  }, [lawyerReviews, reviewCount]);

  // =========================================================
  // FORMAT REVIEW DATE
  // =========================================================

  const formatReviewDate = (review) => {
    const dateValue =
      review?.createdAt ||
      review?.updatedAt;

    if (!dateValue) {
      return "Date not available";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // STAR DISPLAY
  // =========================================================

  const renderStars = (
    rating,
    size = "normal"
  ) => {
    const numericRating =
      Number(rating) || 0;

    return (
      <span
        className={`lawyer-rating-stars lawyer-rating-stars-${size}`}
        aria-label={`${numericRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span
              key={star}
              className={
                star <= numericRating
                  ? "rating-star active"
                  : "rating-star"
              }
            >
              ★
            </span>
          )
        )}
      </span>
    );
  };

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

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

  // =========================================================
  // GET USER IDENTIFIER
  // =========================================================

  const getUserIdentifier = (user) => {
    if (!user) {
      return "";
    }

    return String(
      user.email ||
        user.id ||
        user.userId ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // CREATE / FIND CHAT
  // =========================================================

  const createOrFindChat = (
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

    if (!Array.isArray(chats)) {
      chats = [];
    }

    const clientIdentifier =
      getUserIdentifier(
        loggedInUser
      );

    const lawyerIdentifier =
      getUserIdentifier({
        email: lawyer?.email,
        id: lawyer?.id,
      });

    if (
      !clientIdentifier ||
      !lawyerIdentifier ||
      !lawyer
    ) {
      return null;
    }

    const existingChat =
      chats.find((chat) => {
        const chatClientId =
          String(
            chat?.clientId || ""
          )
            .trim()
            .toLowerCase();

        const chatLawyerId =
          String(
            chat?.lawyerId || ""
          )
            .trim()
            .toLowerCase();

        return (
          chatClientId ===
            clientIdentifier &&
          chatLawyerId ===
            lawyerIdentifier
        );
      });

    if (existingChat) {
      return existingChat.id;
    }

    const now =
      new Date().toISOString();

    const chatId =
      `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    const newChat = {
      id: chatId,

      clientId:
        clientIdentifier,

      clientName:
        loggedInUser.name ||
        loggedInUser.fullName ||
        "Client",

      clientEmail:
        loggedInUser.email || "",

      lawyerId:
        lawyerIdentifier,

      lawyerName:
        lawyer.name,

      lawyerEmail:
        lawyer.email || "",

      lawyerSpecialization:
        lawyer.specialization || "",

      appointmentIds: [],

      lastBookingId: "",

      lastMessage:
        "Conversation started.",

      lastMessageAt:
        now,

      updatedAt:
        now,

      unreadFor: "",

      unreadCount: 0,

      createdAt: now,

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
            `You can now communicate with ${lawyer.name} through AdvocaOne chat.`,

          timestamp:
            now,

          read: true,
        },
      ],
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

  // =========================================================
  // HANDLE CHAT BUTTON
  // =========================================================

  const handleChatWithLawyer = () => {
    const loggedInUser =
      getLoggedInUser();

    if (!loggedInUser) {
      alert(
        "Please login as a client to chat with this lawyer."
      );

      navigate("/login");
      return;
    }

    const role =
      String(
        loggedInUser.role || ""
      )
        .trim()
        .toLowerCase();

    if (role === "admin") {
      alert(
        "Admin accounts cannot start a client-lawyer chat."
      );

      return;
    }

    if (role === "lawyer") {
      const loggedInIdentifier =
        getUserIdentifier(
          loggedInUser
        );

      const currentLawyerIdentifier =
        getUserIdentifier({
          email: lawyer?.email,
          id: lawyer?.id,
        });

      if (
        loggedInIdentifier ===
        currentLawyerIdentifier
      ) {
        alert(
          "You cannot start a chat with yourself."
        );

        return;
      }
    }

    const chatId =
      createOrFindChat(
        loggedInUser
      );

    if (!chatId) {
      alert(
        "Unable to create chat conversation. Please login again."
      );

      return;
    }

    navigate(
      `/chat?chat=${encodeURIComponent(
        chatId
      )}`
    );
  };

  // =========================================================
  // LAWYER NOT FOUND
  // IMPORTANT:
  // ALL HOOKS ARE ABOVE THIS RETURN
  // =========================================================

  if (!lawyer) {
    return (
      <div className="container py-5">
        <h2>Lawyer Not Found</h2>

        <Link
          to="/"
          className="btn btn-primary mt-3"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  // =========================================================
  // STATUS CLASSES
  // =========================================================

  const onlineStatusClass =
    lawyer.onlineStatus === "Online"
      ? "badge bg-success"
      : lawyer.onlineStatus === "Away"
      ? "badge bg-warning text-dark"
      : "badge bg-danger";

  const appointmentStatusClass =
    lawyer.appointmentStatus ===
    "Accepting Appointments"
      ? "badge bg-success"
      : lawyer.appointmentStatus === "Busy"
      ? "badge bg-warning text-dark"
      : "badge bg-danger";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="lawyer-profile-page">

      {/* NAVBAR */}

      <nav className="navbar navbar-dark bg-dark">
        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <Link
            to="/"
            className="btn btn-outline-light"
          >
            ← Home
          </Link>

        </div>
      </nav>

      {/* PROFILE */}

      <div className="container py-5">

        <div className="card shadow-lg lawyer-profile-card">

          <div className="card-body p-4 p-md-5">

            <div className="row">

              {/* LEFT SIDE */}

              <div className="col-md-4 text-center">

                <div className="lawyer-profile-avatar">
                  ⚖️
                </div>

                <h2 className="fw-bold mt-3">
                  {lawyer.name}
                </h2>

                <p className="text-primary fw-semibold">
                  {lawyer.specialization}
                </p>

                {/* RATING SUMMARY */}

                <div className="lawyer-profile-rating-summary mt-3">

                  <div className="rating-main-value">
                    {reviewCount > 0
                      ? averageRating.toFixed(1)
                      : "New"}
                  </div>

                  {reviewCount > 0 ? (
                    <>
                      <div className="rating-main-stars">
                        {renderStars(
                          roundedRating,
                          "large"
                        )}
                      </div>

                      <div className="rating-review-count">
                        {reviewCount}{" "}
                        {reviewCount === 1
                          ? "Review"
                          : "Reviews"}
                      </div>
                    </>
                  ) : (
                    <div className="rating-review-count">
                      No reviews yet
                    </div>
                  )}

                </div>

                {/* STATUS */}

                <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">

                  <span
                    className={
                      onlineStatusClass
                    }
                  >
                    {lawyer.onlineStatus ===
                    "Online"
                      ? "🟢"
                      : lawyer.onlineStatus ===
                        "Away"
                      ? "🟡"
                      : "🔴"}{" "}
                    {lawyer.onlineStatus}
                  </span>

                  <span
                    className={
                      appointmentStatusClass
                    }
                  >
                    {lawyer.appointmentStatus ===
                    "Accepting Appointments"
                      ? "🟢"
                      : lawyer.appointmentStatus ===
                        "Busy"
                      ? "🟡"
                      : "🔴"}{" "}
                    {lawyer.appointmentStatus}
                  </span>

                </div>

                {/* BOOK BUTTON */}

                <div className="mt-4">

                  <Link
                    to={`/booking/${lawyer.id}`}
                    className="btn btn-primary btn-lg w-100"
                  >
                    📅 Book Consultation
                  </Link>

                </div>

                {/* CHAT BUTTON */}

                <div className="mt-2">

                  <button
                    type="button"
                    className="btn btn-success btn-lg w-100"
                    onClick={
                      handleChatWithLawyer
                    }
                  >
                    💬 Chat with Lawyer
                  </button>

                </div>

                <small className="text-muted d-block mt-2">
                  💬 Start a conversation with this
                  lawyer through AdvocaOne.
                </small>

              </div>

              {/* RIGHT SIDE */}

              <div className="col-md-8 mt-4 mt-md-0">

                <h3 className="fw-bold mb-4">
                  Lawyer Information
                </h3>

                <div className="row g-3">

                  {/* Specialization */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        ⚖️ Specialization
                      </strong>

                      <p>
                        {lawyer.specialization}
                      </p>

                    </div>

                  </div>

                  {/* Location */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📍 Location
                      </strong>

                      <p>
                        {lawyer.location}
                      </p>

                    </div>

                  </div>

                  {/* Experience */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        💼 Experience
                      </strong>

                      <p>
                        {lawyer.experience} Years
                      </p>

                    </div>

                  </div>

                  {/* Fee */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        💰 Consultation Fee
                      </strong>

                      <p>
                        ₹{lawyer.consultationFee}
                      </p>

                    </div>

                  </div>

                  {/* Next Available */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📅 Next Available
                      </strong>

                      <p>
                        {lawyer.nextAvailable}
                      </p>

                    </div>

                  </div>

                  {/* Availability */}

                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📌 Availability
                      </strong>

                      <p>
                        {lawyerIsAvailable
                          ? "Available"
                          : "Currently Unavailable"}
                      </p>

                    </div>

                  </div>

                </div>

                <hr className="my-4" />

                {/* AVAILABLE SLOTS */}

                <h3 className="fw-bold">
                  📅 Available Consultation Slots
                </h3>

                {availableDays.length > 0 ? (
                  <div className="mt-3">

                    {availableDays.map(
                      ([day, slots]) => (
                        <div
                          key={day}
                          className="mb-4"
                        >

                          <h5 className="fw-bold text-primary">
                            {day}
                          </h5>

                          <div className="d-flex flex-wrap gap-2 mt-2">

                            {slots.map(
                              (
                                slot,
                                index
                              ) => (
                                <Link
                                  key={`${day}-${slot}-${index}`}
                                  to={`/booking/${lawyer.id}?day=${encodeURIComponent(
                                    day
                                  )}&time=${encodeURIComponent(
                                    slot
                                  )}`}
                                  className="btn btn-outline-primary"
                                >
                                  🕐 {slot}
                                </Link>
                              )
                            )}

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="alert alert-info mt-3">
                    No consultation slots
                    available.
                  </div>
                )}

                <hr className="my-4" />

                {/* REVIEWS */}

                <section className="lawyer-reviews-section">

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">

                    <div>

                      <h3 className="fw-bold mb-1">
                        ⭐ Reviews & Ratings
                      </h3>

                      <p className="text-muted mb-0">
                        Feedback from clients who
                        consulted this lawyer.
                      </p>

                    </div>

                    {reviewCount > 0 && (
                      <div className="reviews-header-rating">

                        <strong>
                          {averageRating.toFixed(1)}
                        </strong>{" "}

                        {renderStars(
                          roundedRating
                        )}{" "}

                        <span className="text-muted">
                          ({reviewCount})
                        </span>

                      </div>
                    )}

                  </div>

                  {reviewCount > 0 ? (
                    <>

                      {/* RATING OVERVIEW */}

                      <div className="rating-overview-card mb-4">

                        <div className="row align-items-center">

                          <div className="col-md-4 text-center">

                            <div className="rating-overview-number">
                              {averageRating.toFixed(
                                1
                              )}
                            </div>

                            <div className="rating-overview-stars">
                              {renderStars(
                                roundedRating,
                                "large"
                              )}
                            </div>

                            <p className="text-muted mb-0">
                              Based on{" "}
                              {reviewCount}{" "}
                              {reviewCount === 1
                                ? "review"
                                : "reviews"}
                            </p>

                          </div>

                          <div className="col-md-8 mt-4 mt-md-0">

                            {ratingDistribution.map(
                              ({
                                rating,
                                count,
                                percentage,
                              }) => (
                                <div
                                  key={rating}
                                  className="rating-distribution-row"
                                >

                                  <div className="rating-distribution-label">
                                    {rating} ★
                                  </div>

                                  <div className="rating-progress">

                                    <div
                                      className="rating-progress-fill"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />

                                  </div>

                                  <div className="rating-distribution-count">
                                    {count}
                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                      {/* REVIEW LIST */}

                      <div className="reviews-list">

                        {lawyerReviews.map(
                          (review, index) => {

                            const reviewerName =
                              review.clientName ||
                              review.clientEmail ||
                              "Anonymous Client";

                            return (
                              <div
                                key={
                                  review.id ||
                                  review.appointmentId ||
                                  index
                                }
                                className="review-card"
                              >

                                <div className="review-card-header">

                                  <div className="reviewer-info">

                                    <div className="reviewer-avatar">
                                      {reviewerName
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div>

                                      <h5 className="fw-bold mb-1">
                                        {reviewerName}
                                      </h5>

                                      <div className="review-meta">

                                        {renderStars(
                                          Number(
                                            review.rating
                                          )
                                        )}

                                        <span>
                                          •
                                        </span>

                                        <span>
                                          {formatReviewDate(
                                            review
                                          )}
                                        </span>

                                      </div>

                                    </div>

                                  </div>

                                  <span className="review-verified-badge">
                                    ✓ Client Review
                                  </span>

                                </div>

                                <div className="review-text mt-3">
                                  {review.comment ||
                                    "No written comment provided."}
                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </>
                  ) : (
                    <div className="no-reviews-card text-center">

                      <div className="no-reviews-icon">
                        ⭐
                      </div>

                      <h4 className="fw-bold">
                        No Reviews Yet
                      </h4>

                      <p className="text-muted mb-0">
                        This lawyer has not received
                        any client reviews yet.
                        Complete a consultation and
                        share your experience.
                      </p>

                    </div>
                  )}

                </section>

                <hr className="my-4" />

                {/* ABOUT LAWYER */}

                <h3 className="fw-bold">
                  About the Lawyer
                </h3>

                <p className="text-muted mt-3">

                  {lawyer.name} is an
                  experienced legal
                  professional specializing
                  in{" "}
                  {lawyer.specialization}.
                  The lawyer provides
                  legal consultation and
                  assistance to clients based
                  on their individual legal
                  requirements.

                </p>

                <h4 className="fw-bold mt-4">
                  Consultation
                </h4>

                <p className="text-muted">

                  Clients can review the
                  lawyer's expertise,
                  availability,
                  consultation fee and
                  client feedback before
                  booking an appointment.

                </p>

                {/* BUTTONS */}

                <div className="mt-4">

                  <Link
                    to={`/booking/${lawyer.id}`}
                    className="btn btn-primary me-2"
                  >
                    📅 Book Appointment
                  </Link>

                  <button
                    type="button"
                    className="btn btn-success me-2"
                    onClick={
                      handleChatWithLawyer
                    }
                  >
                    💬 Chat with Lawyer
                  </button>

                  <Link
                    to="/"
                    className="btn btn-outline-secondary"
                  >
                    ← Find Other Lawyers
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LawyerProfile;