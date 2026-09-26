import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./LawyerDashboard.css";

const LawyerDashboard = () => {
  const navigate = useNavigate();

  /* =====================================================
     GET CURRENT LOGGED-IN LAWYER
  ===================================================== */

  const getCurrentLawyer = () => {
    let lawyers = [];
    let savedProfile = null;
    let loggedInUser = null;

    /* Get registered lawyers */
    try {
      lawyers =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAdminLawyers"
          ) || "[]"
        ) || [];
    } catch {
      lawyers = [];
    }

    /* Get saved lawyer profile */
    try {
      savedProfile =
        JSON.parse(
          localStorage.getItem(
            "advocaOneLawyerProfile"
          ) || "null"
        );
    } catch {
      savedProfile = null;
    }

    /* Get logged-in account */
    try {
      loggedInUser =
        JSON.parse(
          localStorage.getItem(
            "advocaOneLoggedInUser"
          ) || "null"
        );
    } catch {
      loggedInUser = null;
    }

    const loggedInEmail =
      loggedInUser?.email
        ?.trim()
        .toLowerCase() || "";

    /* Find lawyer using logged-in email */
    const existingLawyer =
      lawyers.find(
        (lawyer) =>
          lawyer.email
            ?.trim()
            .toLowerCase() === loggedInEmail
      ) || null;

    /* Use saved profile only if it belongs to
       the currently logged-in lawyer */
    const matchingSavedProfile =
      savedProfile?.email
        ?.trim()
        .toLowerCase() === loggedInEmail
        ? savedProfile
        : null;

    return {
      ...(existingLawyer || {}),
      ...(matchingSavedProfile || {}),

      id:
        existingLawyer?.id ||
        matchingSavedProfile?.id ||
        "",

      name:
        matchingSavedProfile?.name ||
        existingLawyer?.name ||
        loggedInUser?.name ||
        "Lawyer",

      specialization:
        matchingSavedProfile?.specialization ||
        existingLawyer?.specialization ||
        "Not Selected",

      location:
        matchingSavedProfile?.city ||
        existingLawyer?.city ||
        "Not Selected",

      consultationFee:
        matchingSavedProfile?.consultationFee ??
        existingLawyer?.fee ??
        0,

      email:
        existingLawyer?.email ||
        matchingSavedProfile?.email ||
        loggedInUser?.email ||
        "",
    };
  };

  const currentLawyer = getCurrentLawyer();

  /* =====================================================
     LAWYER-SPECIFIC NOTIFICATION STORAGE
  ===================================================== */

  const notificationStorageKey =
    `advocaOneNotifications_${currentLawyer.email
      ?.trim()
      .toLowerCase()}`;

  /* =====================================================
     MAIN STATES
  ===================================================== */

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [lastUpdated, setLastUpdated] =
    useState(null);
  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     MODAL STATES
  ===================================================== */

  const [selectedClient, setSelectedClient] =
    useState(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [rescheduleAppointment, setRescheduleAppointment] =
    useState(null);

  /* =====================================================
     RESCHEDULE STATES
  ===================================================== */

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  /* =====================================================
     NOTIFICATION STATES
  ===================================================== */

  const [notifications, setNotifications] =
    useState([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =====================================================
     LAWYER STATUS
  ===================================================== */

  const [onlineStatus, setOnlineStatus] =
    useState("Online");

  const [appointmentStatus, setAppointmentStatus] =
    useState("Accepting Appointments");

  /* =====================================================
     GET TODAY'S DATE
  ===================================================== */

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =====================================================
     CONVERT AM/PM TIME TO MINUTES
  ===================================================== */

  const getTimeInMinutes = (time) => {
    if (!time) {
      return 0;
    }

    const match = time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) {
      return 0;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);

    const period =
      match[3].toUpperCase();

    if (
      period === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      period === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  /* =====================================================
     SHOW SUCCESS MESSAGE
  ===================================================== */

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  /* =====================================================
     GET APPOINTMENT STATUS
  ===================================================== */

  const getAppointmentStatus = (booking) => {
    return booking.status || "Pending";
  };

  /* =====================================================
     LOAD APPOINTMENTS
  ===================================================== */

  const loadAppointments = useCallback(() => {
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

    const lawyerBookings =
      savedBookings.filter(
        (booking) => {
          const bookingLawyerId =
            String(
              booking.lawyerId ?? ""
            ).trim();

          const currentLawyerId =
            String(
              currentLawyer.id ?? ""
            ).trim();

          const bookingLawyerName =
            String(
              booking.lawyerName ?? ""
            )
              .trim()
              .toLowerCase();

          const currentLawyerName =
            String(
              currentLawyer.name ?? ""
            )
              .trim()
              .toLowerCase();

          return (
            (
              bookingLawyerId &&
              currentLawyerId &&
              bookingLawyerId ===
                currentLawyerId
            ) ||
            (
              bookingLawyerName &&
              currentLawyerName &&
              bookingLawyerName ===
                currentLawyerName
            )
          );
        }
      );

    const formattedAppointments =
      lawyerBookings.map(
        (booking, index) => ({
          ...booking,

          id:
            booking.id ||
            index + 1,

          client:
            booking.client ||
            booking.clientName ||
            booking.name ||
            booking.userName ||
            "Client",

          userEmail:
            booking.userEmail ||
            "Not provided",

          userPhone:
            booking.userPhone ||
            "Not provided",

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

          reason:
            booking.reason ||
            booking.message ||
            booking.consultationReason ||
            "Consultation",

          fee: Number(
            booking.fee ||
              booking.consultationFee ||
              0
          ),

          status:
            getAppointmentStatus(
              booking
            ),
        })
      );

    setAppointments(
      formattedAppointments
    );

    setLastUpdated(
      new Date()
    );
  }, [
    currentLawyer.id,
    currentLawyer.name,
  ]);

  /* =====================================================
     LOAD APPOINTMENTS WHEN DASHBOARD OPENS
  ===================================================== */

  useEffect(() => {
    loadAppointments();

    const interval =
      setInterval(() => {
        loadAppointments();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [loadAppointments]);

  /* =====================================================
     CREATE LAWYER-SPECIFIC NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    let savedNotifications = [];

    try {
      savedNotifications =
        JSON.parse(
          localStorage.getItem(
            notificationStorageKey
          ) || "[]"
        ) || [];
    } catch {
      savedNotifications = [];
    }

    const notificationIds =
      new Set(
        savedNotifications.map(
          (notification) =>
            String(
              notification.appointmentId
            )
        )
      );

    const newNotifications =
      appointments
        .filter(
          (appointment) =>
            appointment.status ===
            "Pending"
        )
        .filter(
          (appointment) =>
            !notificationIds.has(
              String(
                appointment.id
              )
            )
        )
        .map(
          (appointment) => ({
            id:
              `notification-${appointment.id}`,

            appointmentId:
              appointment.id,

            title:
              "New Booking Request",

            message:
              `${appointment.client} requested an appointment ` +
              `on ${appointment.date} at ${appointment.time}.`,

            read: false,

            createdAt:
              new Date().toISOString(),
          })
        );

    const updatedNotifications = [
      ...newNotifications,
      ...savedNotifications,
    ];

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      notificationStorageKey,
      JSON.stringify(
        updatedNotifications
      )
    );
  }, [
    appointments,
    notificationStorageKey,
  ]);

  /* =====================================================
     MARK ALL NOTIFICATIONS AS READ
  ===================================================== */

  const markAllNotificationsRead = () => {
    const updatedNotifications =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      notificationStorageKey,
      JSON.stringify(
        updatedNotifications
      )
    );
  };

  /* =====================================================
     MARK ONE NOTIFICATION AS READ
  ===================================================== */

  const markNotificationRead = (
    notificationId
  ) => {
    const updatedNotifications =
      notifications.map(
        (notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      notificationStorageKey,
      JSON.stringify(
        updatedNotifications
      )
    );
  };

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  /* =====================================================
     UPDATE APPOINTMENT STATUS
  ===================================================== */

  const updateAppointment = (
    id,
    status
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

    setAppointments(
      (currentAppointments) =>
        currentAppointments.map(
          (appointment) =>
            String(
              appointment.id
            ) === String(id)
              ? {
                  ...appointment,
                  status,
                }
              : appointment
        )
    );

    setLastUpdated(
      new Date()
    );

    if (
      status === "Confirmed"
    ) {
      showSuccessMessage(
        "✅ Appointment confirmed successfully."
      );
    } else if (
      status === "Rejected"
    ) {
      showSuccessMessage(
        "❌ Appointment rejected successfully."
      );
    } else if (
      status === "Completed"
    ) {
      showSuccessMessage(
        "🏁 Appointment marked as completed."
      );
    } else if (
      status === "Cancelled"
    ) {
      showSuccessMessage(
        "❌ Appointment cancelled successfully."
      );
    }
  };

  /* =====================================================
     CONFIRM APPOINTMENT
  ===================================================== */

  const handleConfirm = (
    appointment
  ) => {
    const confirmed =
      window.confirm(
        `Confirm appointment with ${appointment.client}?`
      );

    if (!confirmed) {
      return;
    }

    updateAppointment(
      appointment.id,
      "Confirmed"
    );
  };

  /* =====================================================
     REJECT APPOINTMENT
  ===================================================== */

  const handleReject = (
    appointment
  ) => {
    const confirmed =
      window.confirm(
        `Reject appointment with ${appointment.client}?`
      );

    if (!confirmed) {
      return;
    }

    updateAppointment(
      appointment.id,
      "Rejected"
    );

    setStatusFilter(
      "Rejected"
    );
  };

  /* =====================================================
     CANCEL APPOINTMENT
  ===================================================== */

  const handleCancel = (
    appointment
  ) => {
    const confirmed =
      window.confirm(
        `Cancel appointment with ${appointment.client}?`
      );

    if (!confirmed) {
      return;
    }

    updateAppointment(
      appointment.id,
      "Cancelled"
    );
  };

  /* =====================================================
     GET DAY NAME
  ===================================================== */

  const getDayName = (
    dateString
  ) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
      }
    );
  };

  /* =====================================================
     GET AVAILABLE TIME SLOTS
  ===================================================== */

  const getAvailableSlots = () => {
    if (!newDate) {
      return [];
    }

    let availability = {};

    try {
      availability =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAvailability"
          ) || "{}"
        ) || {};
    } catch {
      availability = {};
    }

    const day =
      getDayName(newDate);

    return availability[day] || [];
  };

  /* =====================================================
     OPEN RESCHEDULE MODAL
  ===================================================== */

  const openReschedule = (
    appointment
  ) => {
    setRescheduleAppointment(
      appointment
    );

    setNewDate(
      appointment.date || ""
    );

    setNewTime(
      appointment.time || ""
    );
  };

  /* =====================================================
     SAVE RESCHEDULED APPOINTMENT
  ===================================================== */

  const handleReschedule = () => {
    if (!rescheduleAppointment) {
      return;
    }

    if (!newDate || !newTime) {
      alert(
        "Please select date and time."
      );
      return;
    }

    const today = getToday();

    if (newDate < today) {
      alert(
        "Please select a future date."
      );
      return;
    }

    const availableSlots =
      getAvailableSlots();

    if (
      availableSlots.length > 0 &&
      !availableSlots.includes(
        newTime
      )
    ) {
      alert(
        "Selected time is not available."
      );
      return;
    }

    /* Prevent past time today */
    if (newDate === today) {
      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      if (
        getTimeInMinutes(
          newTime
        ) <= currentMinutes
      ) {
        alert(
          "Please select a future time."
        );
        return;
      }
    }

    /* Prevent double booking */
    const duplicate =
      appointments.some(
        (appointment) =>
          String(
            appointment.id
          ) !==
            String(
              rescheduleAppointment.id
            ) &&
          String(
            appointment.lawyerId
          ) ===
            String(
              rescheduleAppointment.lawyerId
            ) &&
          appointment.date ===
            newDate &&
          appointment.time ===
            newTime &&
          appointment.status !==
            "Cancelled" &&
          appointment.status !==
            "Rejected"
      );

    if (duplicate) {
      alert(
        "This time slot is already booked."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Reschedule ${rescheduleAppointment.client}'s appointment to ${newDate} at ${newTime}?`
      );

    if (!confirmed) {
      return;
    }

    /* Get all saved bookings */
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

    /* Update selected booking */
    const updatedBookings =
      savedBookings.map(
        (booking) =>
          String(
            booking.id
          ) ===
          String(
            rescheduleAppointment.id
          )
            ? {
                ...booking,

                date: newDate,

                day: getDayName(
                  newDate
                ),

                time: newTime,

                status: "Confirmed",
              }
            : booking
      );

    localStorage.setItem(
      "advocaOneBookings",
      JSON.stringify(
        updatedBookings
      )
    );

    setRescheduleAppointment(
      null
    );

    setNewDate("");
    setNewTime("");

    loadAppointments();

    showSuccessMessage(
      "📅 Appointment rescheduled successfully."
    );
  };

  /* =====================================================
     APPOINTMENT COUNTERS
  ===================================================== */

  const totalAppointments =
    appointments.length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Pending"
    );

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Confirmed"
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Completed"
    );

  const rejectedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Rejected"
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Cancelled"
    );

  /* =====================================================
     EARNINGS
  ===================================================== */

  const earningAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
          "Confirmed" ||
        appointment.status ===
          "Completed"
    );

  const totalEarnings =
    earningAppointments.reduce(
      (total, appointment) =>
        total +
        Number(
          appointment.fee || 0
        ),
      0
    );

  const currentDate =
    new Date();

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  const monthlyEarnings =
    earningAppointments
      .filter(
        (appointment) => {
          if (!appointment.date) {
            return false;
          }

          const date =
            new Date(
              `${appointment.date}T00:00:00`
            );

          return (
            date.getMonth() ===
              currentMonth &&
            date.getFullYear() ===
              currentYear
          );
        }
      )
      .reduce(
        (total, appointment) =>
          total +
          Number(
            appointment.fee || 0
          ),
        0
      );

  /* =====================================================
     TODAY'S APPOINTMENTS
  ===================================================== */

  const todayAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.date ===
            getToday() &&
          appointment.status !==
            "Cancelled" &&
          appointment.status !==
            "Rejected"
      )
      .sort(
        (a, b) =>
          getTimeInMinutes(
            a.time
          ) -
          getTimeInMinutes(
            b.time
          )
      );

  /* =====================================================
     UPCOMING APPOINTMENTS
  ===================================================== */

  const upcomingAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.date >
            getToday() &&
          appointment.status ===
            "Confirmed"
      )
      .sort(
        (a, b) => {
          const dateResult =
            a.date.localeCompare(
              b.date
            );

          if (dateResult !== 0) {
            return dateResult;
          }

          return (
            getTimeInMinutes(
              a.time
            ) -
            getTimeInMinutes(
              b.time
            )
          );
        }
      );

  /* =====================================================
     PAST APPOINTMENTS
  ===================================================== */

  const pastAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.date <
          getToday()
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );

  /* =====================================================
     SEARCH AND FILTER
  ===================================================== */

  const filteredAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) => {
          const search =
            searchTerm.toLowerCase();

          const matchesSearch =
            appointment.client
              ?.toLowerCase()
              .includes(search) ||
            appointment.userEmail
              ?.toLowerCase()
              .includes(search) ||
            appointment.userPhone
              ?.toLowerCase()
              .includes(search) ||
            appointment.reason
              ?.toLowerCase()
              .includes(search);

          const matchesStatus =
            statusFilter ===
              "All" ||
            appointment.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      appointments,
      searchTerm,
      statusFilter,
    ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = [
    {
      name: "Pending",
      count:
        pendingAppointments.length,
    },
    {
      name: "Confirmed",
      count:
        confirmedAppointments.length,
    },
    {
      name: "Completed",
      count:
        completedAppointments.length,
    },
    {
      name: "Rejected",
      count:
        rejectedAppointments.length,
    },
    {
      name: "Cancelled",
      count:
        cancelledAppointments.length,
    },
  ];

  const maxStatistic =
    Math.max(
      ...statistics.map(
        (item) => item.count
      ),
      1
    );

  /* =====================================================
     VIEW PENDING APPOINTMENTS
  ===================================================== */

  const viewPending = () => {
    setStatusFilter(
      "Pending"
    );

    setTimeout(() => {
      document
        .getElementById(
          "all-appointments"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  /* =====================================================
     APPOINTMENT CARD
  ===================================================== */

  const AppointmentCard = ({
    appointment,
  }) => {
    const statusClass =
      appointment.status
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );

    return (
      <div className="appointment-card">

        <div className="appointment-main">

          <div className="appointment-client">

            <div className="client-avatar">
              👤
            </div>

            <div>
              <h3>
                {appointment.client}
              </h3>

              <p>
                {appointment.userEmail}
              </p>
            </div>

          </div>

          <span
            className={`status-badge status-${statusClass}`}
          >
            {appointment.status}
          </span>

        </div>

        <div className="appointment-info">

          <span>
            📅{" "}
            {appointment.date ||
              "Date not available"}
          </span>

          <span>
            ⏰{" "}
            {appointment.time ||
              "Time not available"}
          </span>

          <span>
            💻{" "}
            {appointment.type}
          </span>

          <span>
            💰 ₹
            {appointment.fee}
          </span>

        </div>

        <div className="appointment-actions">

          <button
            className="lawyer-btn lawyer-btn-secondary"
            onClick={() =>
              setSelectedAppointment(
                appointment
              )
            }
          >
            📅 Details
          </button>

          <button
            className="lawyer-btn lawyer-btn-secondary"
            onClick={() =>
              setSelectedClient(
                appointment
              )
            }
          >
            👤 Client
          </button>

          {appointment.status ===
            "Pending" && (
            <>
              <button
                className="lawyer-btn lawyer-btn-success"
                onClick={() =>
                  handleConfirm(
                    appointment
                  )
                }
              >
                ✅ Confirm
              </button>

              <button
                className="lawyer-btn lawyer-btn-danger"
                onClick={() =>
                  handleReject(
                    appointment
                  )
                }
              >
                ❌ Reject
              </button>
            </>
          )}

          {appointment.status ===
            "Confirmed" && (
            <>
              <button
                className="lawyer-btn lawyer-btn-success"
                onClick={() =>
                  updateAppointment(
                    appointment.id,
                    "Completed"
                  )
                }
              >
                🏁 Complete
              </button>

              <button
                className="lawyer-btn lawyer-btn-warning"
                onClick={() =>
                  openReschedule(
                    appointment
                  )
                }
              >
                ✏️ Reschedule
              </button>

              <button
                className="lawyer-btn lawyer-btn-danger"
                onClick={() =>
                  handleCancel(
                    appointment
                  )
                }
              >
                ❌ Cancel
              </button>
            </>
          )}

        </div>

      </div>
    );
  };

  /* =====================================================
     RETURN UI
  ===================================================== */

  return (
    <div className="lawyer-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="lawyer-dashboard-header">

        <div className="lawyer-dashboard-title">

          <h1>
            Lawyer Dashboard
          </h1>

          <p>
            Welcome,{" "}
            <strong>
              {currentLawyer.name}
            </strong>
          </p>

        </div>

        <div className="lawyer-dashboard-actions">

          {/* Notifications */}

          <div className="notification-wrapper">

            <button
              className="notification-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >
              🔔

              {unreadNotifications >
                0 && (
                <span className="notification-count">
                  {unreadNotifications}
                </span>
              )}

            </button>

            {showNotifications && (
              <div className="notification-dropdown">

                <div className="notification-header">

                  <h3>
                    Notifications
                  </h3>

                  <button
                    className="notification-read-button"
                    onClick={
                      markAllNotificationsRead
                    }
                  >
                    Mark all read
                  </button>

                </div>

                {notifications.length ===
                0 ? (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      🔔
                    </div>

                    <p>
                      No notifications.
                    </p>

                  </div>
                ) : (
                  notifications
                    .slice(0, 8)
                    .map(
                      (
                        notification
                      ) => (
                        <div
                          key={
                            notification.id
                          }
                          className={`notification-item ${
                            notification.read
                              ? ""
                              : "unread"
                          }`}
                          onClick={() => {
                            markNotificationRead(
                              notification.id
                            );

                            const appointment =
                              appointments.find(
                                (
                                  item
                                ) =>
                                  String(
                                    item.id
                                  ) ===
                                  String(
                                    notification.appointmentId
                                  )
                              );

                            if (
                              appointment
                            ) {
                              setSelectedAppointment(
                                appointment
                              );

                              setShowNotifications(
                                false
                              );
                            }
                          }}
                        >

                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <p>
                            {
                              notification.message
                            }
                          </p>

                        </div>
                      )
                    )
                )}

              </div>
            )}

          </div>

          {/* Refresh */}

          <button
            className="lawyer-btn lawyer-btn-primary"
            onClick={() => {
              loadAppointments();

              showSuccessMessage(
                "🔄 Appointments refreshed."
              );
            }}
          >
            🔄 Refresh
          </button>

          {/* Home */}

          <button
            className="lawyer-btn lawyer-btn-secondary"
            onClick={() =>
              navigate("/")
            }
          >
            🏠 Home
          </button>

        </div>

      </div>

      {/* Last updated */}

      <p>
        Last updated:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "Loading..."}
      </p>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (
        <div className="dashboard-success">
          {successMessage}
        </div>
      )}

      {/* =================================================
          PENDING ALERT
      ================================================= */}

      {pendingAppointments.length >
        0 && (
        <div className="pending-alert">

          <div className="pending-alert-content">

            <div>

              <h3>
                🔔 New Booking Requests
              </h3>

              <p>
                You have{" "}
                {
                  pendingAppointments.length
                }{" "}
                pending booking request
                {pendingAppointments.length >
                1
                  ? "s"
                  : ""}.
              </p>

            </div>

            <button
              className="lawyer-btn lawyer-btn-warning"
              onClick={
                viewPending
              }
            >
              View Pending
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          STATISTICS CARDS
      ================================================= */}

      <div className="dashboard-stats">

        <div className="dashboard-stats-row dashboard-stats-row-top">

          {/* Total */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                📅
              </span>
            </div>

            <h4>
              Total Appointments
            </h4>

            <h2>
              {totalAppointments}
            </h2>

            <p>
              All appointments
            </p>

          </div>

          {/* Pending */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                ⏳
              </span>
            </div>

            <h4>
              Pending
            </h4>

            <h2>
              {pendingAppointments.length}
            </h2>

            <p>
              Need action
            </p>

          </div>

          {/* Confirmed */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                ✅
              </span>
            </div>

            <h4>
              Confirmed
            </h4>

            <h2>
              {confirmedAppointments.length}
            </h2>

            <p>
              Confirmed appointments
            </p>

          </div>

        </div>

        <div className="dashboard-stats-row dashboard-stats-row-bottom">

          {/* Completed */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                🏁
              </span>
            </div>

            <h4>
              Completed
            </h4>

            <h2>
              {completedAppointments.length}
            </h2>

            <p>
              Finished
            </p>

          </div>

          {/* Rejected */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                ❌
              </span>
            </div>

            <h4>
              Rejected
            </h4>

            <h2>
              {rejectedAppointments.length}
            </h2>

            <p>
              Rejected requests
            </p>

          </div>

          {/* Cancelled */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                🚫
              </span>
            </div>

            <h4>
              Cancelled
            </h4>

            <h2>
              {cancelledAppointments.length}
            </h2>

            <p>
              Cancelled appointments
            </p>

          </div>

          {/* Earnings */}

          <div className="dashboard-stat-card">

            <div className="stat-top">
              <span className="stat-icon">
                💰
              </span>
            </div>

            <h4>
              Estimated Earnings
            </h4>

            <h2>
              ₹{totalEarnings}
            </h2>

            <p>
              Confirmed + completed
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          APPOINTMENT OVERVIEW
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              📅 Appointment Overview
            </h2>

            <p>
              Quick overview of your appointments
            </p>

          </div>

        </div>

        <div className="overview-grid">

          <div className="overview-card">

            <h4>
              Today's Appointments
            </h4>

            <h2>
              {todayAppointments.length}
            </h2>

          </div>

          <div className="overview-card">

            <h4>
              Upcoming Appointments
            </h4>

            <h2>
              {upcomingAppointments.length}
            </h2>

          </div>

          <div className="overview-card">

            <h4>
              Total Appointments
            </h4>

            <h2>
              {totalAppointments}
            </h2>

          </div>

        </div>

      </section>

      {/* =================================================
          LAWYER STATUS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              🟢 Lawyer Status
            </h2>

            <p>
              Control your availability status
            </p>

          </div>

        </div>

        <div className="status-grid">

          <div className="status-box">

            <h3>
              Online Status
            </h3>

            <select
              className="status-select"
              value={
                onlineStatus
              }
              onChange={(event) =>
                setOnlineStatus(
                  event.target.value
                )
              }
            >

              <option>
                Online
              </option>

              <option>
                Away
              </option>

              <option>
                Offline
              </option>

            </select>

          </div>

          <div className="status-box">

            <h3>
              Appointment Status
            </h3>

            <select
              className="status-select"
              value={
                appointmentStatus
              }
              onChange={(event) =>
                setAppointmentStatus(
                  event.target.value
                )
              }
            >

              <option>
                Accepting Appointments
              </option>

              <option>
                Busy
              </option>

              <option>
                Not Accepting Appointments
              </option>

            </select>

          </div>

        </div>

      </section>

      {/* =================================================
          EARNINGS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              💰 Earnings Summary
            </h2>

            <p>
              Your appointment earnings
            </p>

          </div>

        </div>

        <div className="earnings-grid">

          <div className="earning-card">

            <h4>
              This Month
            </h4>

            <h2>
              ₹{monthlyEarnings}
            </h2>

          </div>

          <div className="earning-card">

            <h4>
              Total Earnings
            </h4>

            <h2>
              ₹{totalEarnings}
            </h2>

          </div>

          <div className="earning-card">

            <h4>
              Paid Appointments
            </h4>

            <h2>
              {earningAppointments.length}
            </h2>

          </div>

        </div>

      </section>

      {/* =================================================
          STATISTICS CHART
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              📈 Dashboard Statistics
            </h2>

            <p>
              Appointment status overview
            </p>

          </div>

        </div>

        <div className="statistics-chart">

          {statistics.map(
            (item) => {
              const height =
                item.count === 0
                  ? 5
                  : (
                      item.count /
                      maxStatistic
                    ) * 180;

              return (
                <div
                  className="chart-item"
                  key={item.name}
                >

                  <div className="chart-bar-area">

                    <div
                      className="chart-bar"
                      style={{
                        height:
                          `${height}px`,
                      }}
                    >
                      {item.count}
                    </div>

                  </div>

                  <p>
                    {item.name}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* =================================================
          TODAY'S APPOINTMENTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              📅 Today's Appointments
            </h2>

            <p>
              Appointments scheduled for today
            </p>

          </div>

        </div>

        {todayAppointments.length ===
        0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              📅
            </div>

            <p>
              No appointments today.
            </p>

          </div>
        ) : (
          todayAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
                }
              />
            )
          )
        )}

      </section>

      {/* =================================================
          PENDING REQUESTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              ⏳ Pending Booking Requests
            </h2>

            <p>
              Review and manage new booking requests
            </p>

          </div>

        </div>

        {pendingAppointments.length ===
        0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              ✅
            </div>

            <p>
              No pending booking requests.
            </p>

          </div>
        ) : (
          pendingAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
                }
              />
            )
          )
        )}

      </section>

      {/* =================================================
          UPCOMING APPOINTMENTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              📅 Upcoming Appointments
            </h2>

            <p>
              Your future confirmed appointments
            </p>

          </div>

        </div>

        {upcomingAppointments.length ===
        0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              📅
            </div>

            <p>
              No upcoming appointments.
            </p>

          </div>
        ) : (
          upcomingAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
                }
              />
            )
          )
        )}

      </section>

      {/* =================================================
          PAST APPOINTMENTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              🕘 Past Appointments
            </h2>

            <p>
              Previous appointments
            </p>

          </div>

        </div>

        {pastAppointments.length ===
        0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              🕘
            </div>

            <p>
              No past appointments.
            </p>

          </div>
        ) : (
          pastAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
                }
              />
            )
          )
        )}

      </section>

      {/* =================================================
          ALL APPOINTMENTS
      ================================================= */}

      <section
        className="dashboard-section"
        id="all-appointments"
      >

        <div className="dashboard-section-header">

          <div>

            <h2>
              📋 All Appointments
            </h2>

            <p>
              Search and manage all appointments
            </p>

          </div>

        </div>

        <div className="appointment-toolbar">

          <input
            className="search-input"
            type="text"
            placeholder="Search client, email, phone..."
            value={
              searchTerm
            }
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          <select
            className="status-select"
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option>
              All
            </option>

            <option>
              Pending
            </option>

            <option>
              Confirmed
            </option>

            <option>
              Completed
            </option>

            <option>
              Rejected
            </option>

            <option>
              Cancelled
            </option>

          </select>

        </div>

        {filteredAppointments.length ===
        0 ? (
          <div className="empty-state">

            <div className="empty-state-icon">
              🔍
            </div>

            <p>
              No appointments found.
            </p>

          </div>
        ) : (
          filteredAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
                }
              />
            )
          )
        )}

      </section>

      {/* =================================================
          LAWYER PROFILE
      ================================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              👨‍⚖️ Lawyer Profile
            </h2>

            <p>
              Manage your professional profile
            </p>

          </div>

        </div>

        <div className="profile-card">

          <div className="profile-info">

            <h3>
              {currentLawyer.name}
            </h3>

            <p>
              Specialization:{" "}
              {currentLawyer.specialization ||
                "Not specified"}
            </p>

            <p>
              Location:{" "}
              {currentLawyer.location ||
                "Not specified"}
            </p>

            <p>
              Consultation Fee: ₹
              {currentLawyer.consultationFee ||
                0}
            </p>

          </div>

          <div className="profile-actions">

            <button
              className="lawyer-btn lawyer-btn-primary"
              onClick={() =>
                navigate(
                  "/lawyer-profile-manage"
                )
              }
            >
              ⚙️ Manage Profile
            </button>

            <button
              className="lawyer-btn lawyer-btn-secondary"
              onClick={() =>
                navigate(
                  "/manage-availability"
                )
              }
            >
              📅 Manage Availability
            </button>

            <button
              className="lawyer-btn lawyer-btn-success"
              onClick={() =>
                navigate(
                  `/lawyer/${currentLawyer.id}`
                )
              }
            >
              👁️ Public Profile
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          CLIENT DETAILS MODAL
      ================================================= */}

      {selectedClient && (
        <div className="dashboard-modal-overlay">

          <div className="dashboard-modal">

            <div className="dashboard-modal-header">

              <h2>
                👤 Client Details
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedClient(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-detail">

              <span>
                Name
              </span>

              <strong>
                {
                  selectedClient.client
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Email
              </span>

              <strong>
                {
                  selectedClient.userEmail
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Phone
              </span>

              <strong>
                {
                  selectedClient.userPhone
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Consultation
              </span>

              <strong>
                {
                  selectedClient.type
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Reason
              </span>

              <strong>
                {
                  selectedClient.reason
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Date
              </span>

              <strong>
                {
                  selectedClient.date
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Time
              </span>

              <strong>
                {
                  selectedClient.time
                }
              </strong>

            </div>

            <div className="modal-actions">

              <button
                className="lawyer-btn lawyer-btn-secondary"
                onClick={() =>
                  setSelectedClient(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          APPOINTMENT DETAILS MODAL
      ================================================= */}

      {selectedAppointment && (
        <div className="dashboard-modal-overlay">

          <div className="dashboard-modal">

            <div className="dashboard-modal-header">

              <h2>
                📅 Appointment Details
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-detail">

              <span>
                Client
              </span>

              <strong>
                {
                  selectedAppointment.client
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Email
              </span>

              <strong>
                {
                  selectedAppointment.userEmail
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Phone
              </span>

              <strong>
                {
                  selectedAppointment.userPhone
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Date
              </span>

              <strong>
                {
                  selectedAppointment.date
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Time
              </span>

              <strong>
                {
                  selectedAppointment.time
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Consultation
              </span>

              <strong>
                {
                  selectedAppointment.type
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Reason
              </span>

              <strong>
                {
                  selectedAppointment.reason
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Fee
              </span>

              <strong>
                ₹
                {
                  selectedAppointment.fee
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Status
              </span>

              <strong>
                {
                  selectedAppointment.status
                }
              </strong>

            </div>

            <div className="modal-actions">

              {selectedAppointment.status ===
                "Confirmed" && (
                <>
                  <button
                    className="lawyer-btn lawyer-btn-warning"
                    onClick={() => {
                      const appointment =
                        selectedAppointment;

                      setSelectedAppointment(
                        null
                      );

                      openReschedule(
                        appointment
                      );
                    }}
                  >
                    ✏️ Reschedule
                  </button>

                  <button
                    className="lawyer-btn lawyer-btn-success"
                    onClick={() => {
                      updateAppointment(
                        selectedAppointment.id,
                        "Completed"
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    🏁 Complete
                  </button>

                  <button
                    className="lawyer-btn lawyer-btn-danger"
                    onClick={() => {
                      const appointment =
                        selectedAppointment;

                      setSelectedAppointment(
                        null
                      );

                      handleCancel(
                        appointment
                      );
                    }}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}

              <button
                className="lawyer-btn lawyer-btn-secondary"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          RESCHEDULE MODAL
      ================================================= */}

      {rescheduleAppointment && (
        <div className="dashboard-modal-overlay">

          <div className="dashboard-modal">

            <div className="dashboard-modal-header">

              <h2>
                ✏️ Reschedule Appointment
              </h2>

              <button
                className="modal-close"
                onClick={() => {
                  setRescheduleAppointment(
                    null
                  );

                  setNewDate("");
                  setNewTime("");
                }}
              >
                ×
              </button>

            </div>

            <div className="modal-detail">

              <span>
                Client
              </span>

              <strong>
                {
                  rescheduleAppointment.client
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Current Date
              </span>

              <strong>
                {
                  rescheduleAppointment.date
                }
              </strong>

            </div>

            <div className="modal-detail">

              <span>
                Current Time
              </span>

              <strong>
                {
                  rescheduleAppointment.time
                }
              </strong>

            </div>

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <label>
                New Date
              </label>

              <input
                className="search-input"
                type="date"
                value={
                  newDate
                }
                min={getToday()}
                onChange={(event) => {
                  setNewDate(
                    event.target.value
                  );

                  setNewTime("");
                }}
                style={{
                  width:
                    "100%",
                  marginTop:
                    "8px",
                }}
              />

            </div>

            <div
              style={{
                marginTop:
                  "16px",
              }}
            >

              <label>
                New Time
              </label>

              <select
                className="status-select"
                value={
                  newTime
                }
                onChange={(event) =>
                  setNewTime(
                    event.target.value
                  )
                }
                style={{
                  marginTop:
                    "8px",
                }}
              >

                <option value="">
                  Select time
                </option>

                {getAvailableSlots().map(
                  (slot) => (
                    <option
                      key={slot}
                      value={slot}
                    >
                      {slot}
                    </option>
                  )
                )}

              </select>

            </div>

            {newDate &&
              getAvailableSlots()
                .length === 0 && (
                <p>
                  No availability configured
                  for this day.
                </p>
              )}

            <div className="modal-actions">

              <button
                className="lawyer-btn lawyer-btn-primary"
                onClick={
                  handleReschedule
                }
              >
                Save Reschedule
              </button>

              <button
                className="lawyer-btn lawyer-btn-secondary"
                onClick={() => {
                  setRescheduleAppointment(
                    null
                  );

                  setNewDate("");
                  setNewTime("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default LawyerDashboard;