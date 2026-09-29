import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../styles/LawyerDashboard.css";

const STORAGE_KEYS = {
  lawyers: "advocaOneAdminLawyers",
  lawyerProfile: "advocaOneLawyerProfile",
  loggedInUser: "advocaOneLoggedInUser",
  bookings: "advocaOneBookings",
  availability: "advocaOneAvailability",
};

const STATUS_OPTIONS = [
  {
    value: "Online",
    icon: "🟢",
    title: "Online",
    description: "Available now",
  },
  {
    value: "Away",
    icon: "🟡",
    title: "Away",
    description: "Temporarily unavailable",
  },
  {
    value: "Offline",
    icon: "⚫",
    title: "Offline",
    description: "Currently unavailable",
  },
];

const APPOINTMENT_STATUS_OPTIONS = [
  {
    value: "Accepting Appointments",
    icon: "📅",
    title: "Accepting",
    description: "Accepting new bookings",
  },
  {
    value: "Busy",
    icon: "🔴",
    title: "Busy",
    description: "Temporarily busy",
  },
  {
    value: "Not Accepting Appointments",
    icon: "🚫",
    title: "Not Accepting",
    description: "No new bookings",
  },
];

const getSafeJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
};

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const getCurrentUser = () => {
  const user = getSafeJSON(
    STORAGE_KEYS.loggedInUser,
    null
  );

  if (!user) {
    return null;
  }

  return user;
};

const getCurrentLawyer = () => {
  const loggedInUser = getCurrentUser();

  const lawyers = getSafeJSON(
    STORAGE_KEYS.lawyers,
    []
  );

  const lawyerProfile = getSafeJSON(
    STORAGE_KEYS.lawyerProfile,
    null
  );

  const email = normalizeEmail(
    loggedInUser?.email ||
      lawyerProfile?.email ||
      ""
  );

  let lawyer = null;

  if (email) {
    lawyer =
      lawyers.find(
        (item) =>
          normalizeEmail(item?.email) ===
          email
      ) || null;
  }

  if (!lawyer && lawyerProfile) {
    lawyer = lawyerProfile;
  }

  if (
    !lawyer &&
    loggedInUser?.role?.toLowerCase?.() ===
      "lawyer"
  ) {
    lawyer = loggedInUser;
  }

  if (!lawyer) {
    return null;
  }

  return {
    ...lawyerProfile,
    ...lawyer,

    id:
      lawyer.id ||
      lawyerProfile?.id ||
      loggedInUser?.id ||
      `lawyer-${email}`,

    name:
      lawyer.name ||
      lawyerProfile?.name ||
      loggedInUser?.name ||
      "Lawyer",

    specialization:
      lawyer.specialization ||
      lawyer.practiceArea ||
      lawyerProfile?.specialization ||
      "General Practice",

    location:
      lawyer.location ||
      lawyer.city ||
      lawyerProfile?.location ||
      "India",

    consultationFee:
      lawyer.consultationFee ??
      lawyerProfile?.consultationFee ??
      0,

    email:
      lawyer.email ||
      lawyerProfile?.email ||
      loggedInUser?.email ||
      "",
  };
};

const getStatusStorageKey = (email) =>
  `advocaOneLawyerStatus_${normalizeEmail(
    email
  )}`;

const getDefaultStatus = () => ({
  onlineStatus: "Online",
  appointmentStatus:
    "Accepting Appointments",
  updatedAt: new Date().toISOString(),
});

const getSavedLawyerStatus = (email) => {
  if (!email) {
    return getDefaultStatus();
  }

  const key = getStatusStorageKey(email);
  const saved = getSafeJSON(key, null);

  if (!saved) {
    const defaultStatus =
      getDefaultStatus();

    localStorage.setItem(
      key,
      JSON.stringify(defaultStatus)
    );

    return defaultStatus;
  }

  return {
    ...getDefaultStatus(),
    ...saved,
  };
};

const saveLawyerStatus = (
  email,
  onlineStatus,
  appointmentStatus
) => {
  if (!email) {
    return;
  }

  const statusData = {
    onlineStatus,
    appointmentStatus,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    getStatusStorageKey(email),
    JSON.stringify(statusData)
  );

  window.dispatchEvent(
    new CustomEvent(
      "advocaOneDataUpdated",
      {
        detail: {
          type: "lawyer-status-updated",
          email: normalizeEmail(email),
          ...statusData,
        },
      }
    )
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
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

const formatTime = (timeValue) => {
  if (!timeValue) {
    return "—";
  }

  const date = new Date(
    `2000-01-01T${timeValue}`
  );

  if (Number.isNaN(date.getTime())) {
    return timeValue;
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatDateTime = (
  dateValue,
  timeValue
) => {
  if (!dateValue) {
    return "—";
  }

  return `${formatDate(dateValue)}${
    timeValue
      ? ` • ${formatTime(timeValue)}`
      : ""
  }`;
};

const getAppointmentDate = (
  appointment
) =>
  appointment?.date ||
  appointment?.appointmentDate ||
  appointment?.bookingDate ||
  "";

const getAppointmentTime = (
  appointment
) =>
  appointment?.time ||
  appointment?.appointmentTime ||
  appointment?.bookingTime ||
  "";

const getAppointmentStatus = (
  appointment
) =>
  appointment?.status || "Pending";

const getClientName = (
  appointment
) =>
  appointment?.clientName ||
  appointment?.userName ||
  appointment?.name ||
  appointment?.client?.name ||
  "Client";

const getClientEmail = (
  appointment
) =>
  appointment?.clientEmail ||
  appointment?.userEmail ||
  appointment?.email ||
  appointment?.client?.email ||
  "—";

const getClientPhone = (
  appointment
) =>
  appointment?.clientPhone ||
  appointment?.phone ||
  appointment?.mobile ||
  appointment?.client?.phone ||
  "—";

const getAppointmentReason = (
  appointment
) =>
  appointment?.reason ||
  appointment?.purpose ||
  appointment?.message ||
  appointment?.description ||
  "Consultation";

const getConsultationType = (
  appointment
) =>
  appointment?.consultationType ||
  appointment?.type ||
  "Online";

const getAppointmentFee = (
  appointment
) => {
  const fee =
    appointment?.consultationFee ??
    appointment?.fee ??
    appointment?.amount ??
    0;

  const numericFee = Number(
    String(fee).replace(
      /[^\d.]/g,
      ""
    )
  );

  return Number.isFinite(
    numericFee
  )
    ? numericFee
    : 0;
};

const getBookingTimestamp = (
  appointment
) => {
  const date =
    getAppointmentDate(appointment);

  const time =
    getAppointmentTime(appointment);

  if (!date) {
    return 0;
  }

  const value = time
    ? new Date(`${date}T${time}`)
    : new Date(date);

  const timestamp =
    value.getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const isSameDay = (
  dateValue,
  targetDate
) => {
  if (!dateValue || !targetDate) {
    return false;
  }

  return dateValue === targetDate;
};

const getTodayString = () => {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
=====================================================
CLIENT NOTIFICATION HELPER
=====================================================
*/

const createUserNotification = (
  email,
  notification
) => {
  const normalizedEmail =
    normalizeEmail(email);

  if (
    !normalizedEmail ||
    normalizedEmail === "—"
  ) {
    return;
  }

  const key =
    `advocaOneNotifications_${normalizedEmail}`;

  const existing =
    getSafeJSON(key, []);

  const newNotification = {
    id:
      `notification_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    read: false,

    createdAt:
      new Date().toISOString(),

    ...notification,
  };

  const updated = [
    newNotification,
    ...(Array.isArray(existing)
      ? existing
      : []),
  ];

  localStorage.setItem(
    key,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new CustomEvent(
      "advocaOneDataUpdated"
    )
  );
};

function LawyerDashboard() {
  const navigate =
    useNavigate();

  const [
    currentLawyer,
    setCurrentLawyer,
  ] = useState(() =>
    getCurrentLawyer()
  );

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    activeAppointmentSection,
    setActiveAppointmentSection,
  ] = useState("Today");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = useState(null);

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null);

  const [
    showRescheduleModal,
    setShowRescheduleModal,
  ] = useState(false);

  const [
    rescheduleAppointment,
    setRescheduleAppointment,
  ] = useState(null);

  const [
    rescheduleDate,
    setRescheduleDate,
  ] = useState("");

  const [
    rescheduleTime,
    setRescheduleTime,
  ] = useState("");

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    onlineStatus,
    setOnlineStatus,
  ] = useState(() =>
    getSavedLawyerStatus(
      getCurrentLawyer()?.email
    ).onlineStatus
  );

  const [
    appointmentStatus,
    setAppointmentStatus,
  ] = useState(() =>
    getSavedLawyerStatus(
      getCurrentLawyer()?.email
    ).appointmentStatus
  );

  const [
    statusUpdatedAt,
    setStatusUpdatedAt,
  ] = useState(() =>
    getSavedLawyerStatus(
      getCurrentLawyer()?.email
    ).updatedAt
  );

  const loadLawyer =
    useCallback(() => {
      const lawyer =
        getCurrentLawyer();

      setCurrentLawyer(lawyer);

      if (lawyer?.email) {
        const savedStatus =
          getSavedLawyerStatus(
            lawyer.email
          );

        setOnlineStatus(
          savedStatus.onlineStatus
        );

        setAppointmentStatus(
          savedStatus.appointmentStatus
        );

        setStatusUpdatedAt(
          savedStatus.updatedAt
        );
      }
    }, []);

  const loadAppointments =
    useCallback(() => {
      const lawyer =
        getCurrentLawyer();

      if (!lawyer) {
        setAppointments([]);
        return;
      }

      const bookings =
        getSafeJSON(
          STORAGE_KEYS.bookings,
          []
        );

      const lawyerEmail =
        normalizeEmail(
          lawyer.email
        );

      const lawyerId =
        String(
          lawyer.id || ""
        );

      const lawyerName =
        String(
          lawyer.name || ""
        )
          .trim()
          .toLowerCase();

      const filtered =
        bookings
          .map(
            (
              booking,
              index
            ) => ({
              ...booking,
              _originalIndex:
                index,
            })
          )
          .filter(
            (booking) => {
              const bookingLawyerId =
                String(
                  booking?.lawyerId ||
                    booking?.lawyer?.id ||
                    ""
                );

              const bookingLawyerEmail =
                normalizeEmail(
                  booking?.lawyerEmail ||
                    booking?.lawyer?.email ||
                    ""
                );

              const bookingLawyerName =
                String(
                  booking?.lawyerName ||
                    booking?.lawyer?.name ||
                    ""
                )
                  .trim()
                  .toLowerCase();

              return (
                (lawyerId &&
                  bookingLawyerId ===
                    lawyerId) ||
                (lawyerEmail &&
                  bookingLawyerEmail ===
                    lawyerEmail) ||
                (lawyerName &&
                  bookingLawyerName ===
                    lawyerName)
              );
            }
          )
          .map(
            (
              booking,
              index
            ) => ({
              ...booking,
              id:
                booking.id ||
                `booking-${booking._originalIndex ??
                  index}`,
            })
          );

      setAppointments(filtered);
    }, []);

  const loadNotifications =
    useCallback(() => {
      const lawyer =
        getCurrentLawyer();

      if (!lawyer?.email) {
        setNotifications([]);
        return;
      }

      const key =
        `advocaOneNotifications_${normalizeEmail(
          lawyer.email
        )}`;

      const saved =
        getSafeJSON(key, []);

      setNotifications(
        Array.isArray(saved)
          ? saved
          : []
      );
    }, []);

  useEffect(() => {
    loadLawyer();
    loadAppointments();
    loadNotifications();

    const handleStorage = () => {
      loadLawyer();
      loadAppointments();
      loadNotifications();
    };

    const handleDataUpdate = () => {
      loadLawyer();
      loadAppointments();
      loadNotifications();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "focus",
      handleStorage
    );

    window.addEventListener(
      "advocaOneDataUpdated",
      handleDataUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "focus",
        handleStorage
      );

      window.removeEventListener(
        "advocaOneDataUpdated",
        handleDataUpdate
      );
    };
  }, [
    loadLawyer,
    loadAppointments,
    loadNotifications,
  ]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer =
      setTimeout(() => {
        setMessage("");
      }, 3500);

    return () =>
      clearTimeout(timer);
  }, [message]);

  const unreadNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.read
        ).length,
      [notifications]
    );

  const pendingAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            getAppointmentStatus(
              appointment
            ) === "Pending"
        ),
      [appointments]
    );

  const confirmedAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            getAppointmentStatus(
              appointment
            ) === "Confirmed"
        ),
      [appointments]
    );

  const completedAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            getAppointmentStatus(
              appointment
            ) === "Completed"
        ),
      [appointments]
    );

  const rejectedAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            getAppointmentStatus(
              appointment
            ) === "Rejected"
        ),
      [appointments]
    );

  const cancelledAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            getAppointmentStatus(
              appointment
            ) === "Cancelled"
        ),
      [appointments]
    );

  const todayAppointments =
    useMemo(() => {
      const today =
        getTodayString();

      return appointments
        .filter(
          (appointment) =>
            isSameDay(
              getAppointmentDate(
                appointment
              ),
              today
            )
        )
        .sort(
          (a, b) =>
            getBookingTimestamp(
              a
            ) -
            getBookingTimestamp(
              b
            )
        );
    }, [appointments]);

  const upcomingAppointments =
    useMemo(() => {
      const now = Date.now();

      return appointments
        .filter(
          (appointment) => {
            const status =
              getAppointmentStatus(
                appointment
              );

            return (
              [
                "Confirmed",
                "Pending",
              ].includes(status) &&
              getBookingTimestamp(
                appointment
              ) > now
            );
          }
        )
        .sort(
          (a, b) =>
            getBookingTimestamp(
              a
            ) -
            getBookingTimestamp(
              b
            )
        );
    }, [appointments]);

  const pastAppointments =
    useMemo(() => {
      const now = Date.now();

      return appointments
        .filter(
          (appointment) => {
            const timestamp =
              getBookingTimestamp(
                appointment
              );

            return (
              timestamp > 0 &&
              timestamp < now
            );
          }
        )
        .sort(
          (a, b) =>
            getBookingTimestamp(
              b
            ) -
            getBookingTimestamp(
              a
            )
        );
    }, [appointments]);

  const filteredAppointments =
    useMemo(() => {
      let result =
        appointments;

      if (
        activeAppointmentSection ===
        "Today"
      ) {
        result =
          todayAppointments;
      }

      if (
        activeAppointmentSection ===
        "Pending"
      ) {
        result =
          pendingAppointments;
      }

      if (
        activeAppointmentSection ===
        "Upcoming"
      ) {
        result =
          upcomingAppointments;
      }

      if (
        activeAppointmentSection ===
        "Past"
      ) {
        result =
          pastAppointments;
      }

      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (appointment) => {
              const values = [
                getClientName(
                  appointment
                ),
                getClientEmail(
                  appointment
                ),
                getClientPhone(
                  appointment
                ),
                getAppointmentReason(
                  appointment
                ),
              ];

              return values.some(
                (value) =>
                  String(value)
                    .toLowerCase()
                    .includes(query)
              );
            }
          );
      }

      if (
        statusFilter !== "All"
      ) {
        result =
          result.filter(
            (appointment) =>
              getAppointmentStatus(
                appointment
              ) === statusFilter
          );
      }

      return result;
    }, [
      activeAppointmentSection,
      appointments,
      pendingAppointments,
      todayAppointments,
      upcomingAppointments,
      pastAppointments,
      searchTerm,
      statusFilter,
    ]);

  const totalEarnings =
    useMemo(
      () =>
        appointments
          .filter(
            (appointment) =>
              [
                "Confirmed",
                "Completed",
              ].includes(
                getAppointmentStatus(
                  appointment
                )
              )
          )
          .reduce(
            (
              total,
              appointment
            ) =>
              total +
              getAppointmentFee(
                appointment
              ),
            0
          ),
      [appointments]
    );

  const monthlyEarnings =
    useMemo(() => {
      const now =
        new Date();

      return appointments
        .filter(
          (appointment) => {
            const status =
              getAppointmentStatus(
                appointment
              );

            const date =
              getAppointmentDate(
                appointment
              );

            if (
              ![
                "Confirmed",
                "Completed",
              ].includes(
                status
              ) ||
              !date
            ) {
              return false;
            }

            const appointmentDate =
              new Date(date);

            return (
              appointmentDate.getMonth() ===
                now.getMonth() &&
              appointmentDate.getFullYear() ===
                now.getFullYear()
            );
          }
        )
        .reduce(
          (
            total,
            appointment
          ) =>
            total +
            getAppointmentFee(
              appointment
            ),
          0
        );
    }, [appointments]);

  const statistics =
    useMemo(
      () => [
        {
          label: "Pending",
          value:
            pendingAppointments.length,
          className:
            "pending",
        },
        {
          label: "Confirmed",
          value:
            confirmedAppointments.length,
          className:
            "confirmed",
        },
        {
          label: "Completed",
          value:
            completedAppointments.length,
          className:
            "completed",
        },
        {
          label: "Rejected",
          value:
            rejectedAppointments.length,
          className:
            "rejected",
        },
        {
          label: "Cancelled",
          value:
            cancelledAppointments.length,
          className:
            "cancelled",
        },
      ],
      [
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        rejectedAppointments,
        cancelledAppointments,
      ]
    );

  const saveAppointments = (
    updatedAppointment,
    targetAppointment
  ) => {
    const allBookings =
      getSafeJSON(
        STORAGE_KEYS.bookings,
        []
      );

    const targetId =
      targetAppointment?.id;

    const targetIndex =
      targetAppointment?._originalIndex;

    const originalIndex =
      Number.isInteger(
        targetIndex
      )
        ? targetIndex
        : allBookings.findIndex(
            (booking) =>
              String(
                booking?.id
              ) ===
              String(
                targetId
              )
          );

    if (
      originalIndex >= 0 &&
      originalIndex <
        allBookings.length
    ) {
      allBookings[
        originalIndex
      ] = updatedAppointment;
    } else {
      const fallbackIndex =
        allBookings.findIndex(
          (booking) => {
            const bookingId =
              String(
                booking?.id ||
                  ""
              );

            return (
              bookingId &&
              bookingId ===
                String(
                  targetId
                )
            );
          }
        );

      if (
        fallbackIndex >= 0
      ) {
        allBookings[
          fallbackIndex
        ] =
          updatedAppointment;
      }
    }

    localStorage.setItem(
      STORAGE_KEYS.bookings,
      JSON.stringify(
        allBookings
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        "advocaOneDataUpdated"
      )
    );

    loadAppointments();
    loadNotifications();
  };

  /*
  =====================================================
  APPOINTMENT STATUS UPDATE + CLIENT NOTIFICATION
  =====================================================
  */

  const updateAppointmentStatus = (
    appointment,
    newStatus
  ) => {
    if (!appointment) {
      return;
    }

    const updatedAppointment =
      {
        ...appointment,
        status: newStatus,
        updatedAt:
          new Date().toISOString(),
      };

    // Save appointment status
    saveAppointments(
      updatedAppointment,
      appointment
    );

    // -----------------------------------------
    // CLIENT NOTIFICATION
    // -----------------------------------------

    const clientEmail =
      getClientEmail(
        appointment
      );

    const lawyerName =
      currentLawyer?.name ||
      appointment?.lawyerName ||
      "your lawyer";

    const notificationMessages =
      {
        Confirmed: {
          title:
            "Appointment Confirmed",
          message:
            `Your appointment with ${lawyerName} has been confirmed.`,
        },

        Rejected: {
          title:
            "Appointment Rejected",
          message:
            `Your appointment with ${lawyerName} has been rejected.`,
        },

        Cancelled: {
          title:
            "Appointment Cancelled",
          message:
            `Your appointment with ${lawyerName} has been cancelled.`,
        },

        Completed: {
          title:
            "Appointment Completed",
          message:
            `Your appointment with ${lawyerName} has been completed.`,
        },
      };

    const notification =
      notificationMessages[
        newStatus
      ];

    if (
      notification &&
      clientEmail &&
      clientEmail !== "—"
    ) {
      createUserNotification(
        clientEmail,
        {
          type:
            "appointment",

          title:
            notification.title,

          message:
            notification.message,

          appointmentId:
            appointment.id ||
            appointment._originalIndex ||
            "",
        }
      );
    }

    setSelectedAppointment(
      newStatus === "Pending"
        ? appointment
        : null
    );

    setMessage(
      `Appointment ${newStatus.toLowerCase()} successfully.`
    );
  };

  const handleConfirm = (
    appointment
  ) => {
    updateAppointmentStatus(
      appointment,
      "Confirmed"
    );
  };

  const handleReject = (
    appointment
  ) => {
    updateAppointmentStatus(
      appointment,
      "Rejected"
    );
  };

  const handleCancel = (
    appointment
  ) => {
    updateAppointmentStatus(
      appointment,
      "Cancelled"
    );
  };

  const handleComplete = (
    appointment
  ) => {
    updateAppointmentStatus(
      appointment,
      "Completed"
    );
  };

  const openReschedule = (
    appointment
  ) => {
    setRescheduleAppointment(
      appointment
    );

    setRescheduleDate(
      getAppointmentDate(
        appointment
      )
    );

    setRescheduleTime(
      getAppointmentTime(
        appointment
      )
    );

    setShowRescheduleModal(
      true
    );
  };

  const getAvailableSlots = (
    dateValue
  ) => {
    if (!dateValue) {
      return [];
    }

    const availability =
      getSafeJSON(
        STORAGE_KEYS.availability,
        []
      );

    if (
      Array.isArray(
        availability
      )
    ) {
      const date =
        new Date(
          `${dateValue}T00:00:00`
        );

      const weekday =
        date.toLocaleDateString(
          "en-US",
          {
            weekday:
              "long",
          }
        );

      const matching =
        availability.find(
          (item) =>
            item?.day ===
              weekday ||
            item?.weekday ===
              weekday ||
            item?.date ===
              dateValue
        );

      if (matching) {
        return (
          matching.slots ||
          matching.availableSlots ||
          []
        );
      }
    }

    if (
      availability &&
      typeof availability ===
        "object"
    ) {
      const date =
        new Date(
          `${dateValue}T00:00:00`
        );

      const weekday =
        date.toLocaleDateString(
          "en-US",
          {
            weekday:
              "long",
          }
        );

      const matching =
        availability[
          weekday
        ] ||
        availability[
          dateValue
        ];

      if (
        Array.isArray(
          matching
        )
      ) {
        return matching;
      }

      if (matching?.slots) {
        return matching.slots;
      }
    }

    return [];
  };

  const handleRescheduleSubmit =
    (event) => {
      event.preventDefault();

      if (
        !rescheduleAppointment ||
        !rescheduleDate ||
        !rescheduleTime
      ) {
        setMessage(
          "Please select a date and time."
        );
        return;
      }

      const selectedDateTime =
        new Date(
          `${rescheduleDate}T${rescheduleTime}`
        );

      if (
        Number.isNaN(
          selectedDateTime.getTime()
        )
      ) {
        setMessage(
          "Invalid date or time."
        );
        return;
      }

      if (
        selectedDateTime.getTime() <=
        Date.now()
      ) {
        setMessage(
          "Please select a future date and time."
        );
        return;
      }

      const slots =
        getAvailableSlots(
          rescheduleDate
        );

      if (slots.length > 0) {
        const normalizedTime =
          rescheduleTime.slice(
            0,
            5
          );

        const isAvailable =
          slots.some(
            (slot) => {
              const slotValue =
                typeof slot ===
                "string"
                  ? slot
                  : slot?.time ||
                    slot?.start ||
                    "";

              return (
                String(
                  slotValue
                ).slice(
                  0,
                  5
                ) ===
                normalizedTime
              );
            }
          );

        if (!isAvailable) {
          setMessage(
            "Selected time is not available."
          );
          return;
        }
      }

      const duplicate =
        appointments.some(
          (appointment) => {
            if (
              String(
                appointment.id
              ) ===
              String(
                rescheduleAppointment.id
              )
            ) {
              return false;
            }

            return (
              getAppointmentDate(
                appointment
              ) ===
                rescheduleDate &&
              getAppointmentTime(
                appointment
              ).slice(
                0,
                5
              ) ===
                rescheduleTime.slice(
                  0,
                  5
                ) &&
              [
                "Pending",
                "Confirmed",
              ].includes(
                getAppointmentStatus(
                  appointment
                )
              )
            );
          }
        );

      if (duplicate) {
        setMessage(
          "This time slot is already booked."
        );
        return;
      }

      const updatedAppointment =
        {
          ...rescheduleAppointment,

          date:
            rescheduleDate,

          appointmentDate:
            rescheduleDate,

          time:
            rescheduleTime,

          appointmentTime:
            rescheduleTime,

          status:
            "Confirmed",

          updatedAt:
            new Date().toISOString(),
        };

      saveAppointments(
        updatedAppointment,
        rescheduleAppointment
      );

      // Client notification for reschedule
      const clientEmail =
        getClientEmail(
          rescheduleAppointment
        );

      const lawyerName =
        currentLawyer?.name ||
        rescheduleAppointment?.lawyerName ||
        "your lawyer";

      if (
        clientEmail &&
        clientEmail !== "—"
      ) {
        createUserNotification(
          clientEmail,
          {
            type:
              "appointment",

            title:
              "Appointment Rescheduled",

            message:
              `Your appointment with ${lawyerName} has been rescheduled to ${formatDate(
                rescheduleDate
              )} at ${formatTime(
                rescheduleTime
              )}.`,

            appointmentId:
              rescheduleAppointment.id ||
              rescheduleAppointment._originalIndex ||
              "",
          }
        );
      }

      setShowRescheduleModal(
        false
      );

      setRescheduleAppointment(
        null
      );

      setRescheduleDate("");

      setRescheduleTime("");

      setMessage(
        "Appointment rescheduled successfully."
      );
    };

  const updateNotifications = (
    updated
  ) => {
    if (!currentLawyer?.email) {
      return;
    }

    const key =
      `advocaOneNotifications_${normalizeEmail(
        currentLawyer.email
      )}`;

    localStorage.setItem(
      key,
      JSON.stringify(updated)
    );

    setNotifications(
      updated
    );

    window.dispatchEvent(
      new CustomEvent(
        "advocaOneDataUpdated"
      )
    );
  };

  const markAllNotificationsRead =
    () => {
      const updated =
        notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        );

      updateNotifications(
        updated
      );
    };

  const markNotificationRead = (
    notification
  ) => {
    const updated =
      notifications.map(
        (item) =>
          item.id ===
          notification.id
            ? {
                ...item,
                read: true,
              }
            : item
      );

    updateNotifications(
      updated
    );

    const appointment =
      appointments.find(
        (item) =>
          String(item.id) ===
          String(
            notification.appointmentId
          )
      );

    if (appointment) {
      setSelectedAppointment(
        appointment
      );
    }
  };

  const handleOnlineStatusChange =
    (value) => {
      setOnlineStatus(
        value
      );

      const timestamp =
        new Date().toISOString();

      setStatusUpdatedAt(
        timestamp
      );

      saveLawyerStatus(
        currentLawyer?.email,
        value,
        appointmentStatus
      );

      setMessage(
        `Online status changed to ${value}.`
      );
    };

  const handleAppointmentStatusChange =
    (value) => {
      setAppointmentStatus(
        value
      );

      const timestamp =
        new Date().toISOString();

      setStatusUpdatedAt(
        timestamp
      );

      saveLawyerStatus(
        currentLawyer?.email,
        onlineStatus,
        value
      );

      setMessage(
        `Appointment availability changed to ${value}.`
      );
    };

  const handleRefresh = () => {
    loadLawyer();
    loadAppointments();
    loadNotifications();

    setMessage(
      "Dashboard refreshed successfully."
    );
  };

  const formatLastUpdated =
    () => {
      if (!statusUpdatedAt) {
        return "Just now";
      }

      const date =
        new Date(
          statusUpdatedAt
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Just now";
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  const onlineStatusClass =
    onlineStatus
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  const appointmentStatusClass =
    appointmentStatus
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  if (!currentLawyer) {
    return (
      <div className="lawyer-dashboard">
        <div className="lawyer-empty-page">
          <div className="lawyer-empty-icon">
            ⚠️
          </div>

          <h2>
            Lawyer Account Not Found
          </h2>

          <p>
            Please login with a
            registered lawyer
            account to open the
            Lawyer Dashboard.
          </p>

          <button
            className="lawyer-btn lawyer-btn-primary"
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lawyer-dashboard">

      {/* HEADER */}
      <header className="lawyer-dashboard-header">
        <div>
          <div className="lawyer-dashboard-eyebrow">
            ADV OCAONE • LAWYER PORTAL
          </div>

          <h1 className="lawyer-dashboard-title">
            Lawyer Dashboard
          </h1>

          <p className="lawyer-dashboard-subtitle">
            Welcome back,{" "}
            <strong>
              {currentLawyer.name}
            </strong>
            . Manage your
            appointments,
            profile and
            availability.
          </p>
        </div>

        <div className="lawyer-dashboard-actions">

          {/* NOTIFICATION */}
          <div className="notification-wrapper">
            <button
              className="notification-button"
              onClick={() =>
                setNotificationOpen(
                  (previous) =>
                    !previous
                )
              }
              aria-label="Notifications"
            >
              🔔

              {unreadNotifications >
                0 && (
                <span className="notification-count">
                  {
                    unreadNotifications
                  }
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="notification-dropdown">

                <div className="notification-dropdown-header">
                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <span>
                      {
                        unreadNotifications
                      }{" "}
                      unread
                    </span>
                  </div>

                  {unreadNotifications >
                    0 && (
                    <button
                      className="notification-mark-all"
                      onClick={
                        markAllNotificationsRead
                      }
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length ===
                  0 ? (
                    <div className="notification-empty">
                      <span>
                        🔔
                      </span>

                      <p>
                        No notifications
                      </p>
                    </div>
                  ) : (
                    notifications
                      .slice(
                        0,
                        10
                      )
                      .map(
                        (
                          notification
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            className={`notification-item ${
                              notification.read
                                ? ""
                                : "unread"
                            }`}
                            onClick={() =>
                              markNotificationRead(
                                notification
                              )
                            }
                          >
                            <span className="notification-item-icon">
                              📅
                            </span>

                            <span className="notification-item-content">
                              <strong>
                                {
                                  notification.title ||
                                  "New Booking Request"
                                }
                              </strong>

                              <span>
                                {
                                  notification.message ||
                                  "You have a new appointment request."
                                }
                              </span>

                              <small>
                                {notification.createdAt
                                  ? formatDate(
                                      notification.createdAt
                                    )
                                  : ""}
                              </small>
                            </span>
                          </button>
                        )
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className="lawyer-btn lawyer-btn-secondary"
            onClick={
              handleRefresh
            }
          >
            ↻ Refresh
          </button>

          <button
            className="lawyer-btn lawyer-btn-secondary"
            onClick={() =>
              navigate("/")
            }
          >
            🏠 Home
          </button>
        </div>
      </header>

      {/* MESSAGE */}
      {message && (
        <div className="lawyer-success-message">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* PENDING ALERT */}
      {pendingAppointments.length >
        0 && (
        <div className="lawyer-pending-alert">
          <div className="lawyer-pending-alert-icon">
            ⏳
          </div>

          <div>
            <strong>
              You have{" "}
              {
                pendingAppointments.length
              }{" "}
              pending booking
              request
              {pendingAppointments.length !==
              1
                ? "s"
                : ""}
              .
            </strong>

            <p>
              Review and confirm or
              reject the appointment
              requests.
            </p>
          </div>

          <button
            className="lawyer-btn lawyer-btn-primary"
            onClick={() =>
              setActiveAppointmentSection(
                "Pending"
              )
            }
          >
            View Requests
          </button>
        </div>
      )}

      {/* QUICK STATS */}
      <section className="dashboard-stats">

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon blue">
            📅
          </div>

          <div>
            <span>
              Total Appointments
            </span>

            <strong>
              {
                appointments.length
              }
            </strong>

            <small>
              All appointments
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon orange">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {
                pendingAppointments.length
              }
            </strong>

            <small>
              Need action
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon green">
            ✓
          </div>

          <div>
            <span>
              Confirmed
            </span>

            <strong>
              {
                confirmedAppointments.length
              }
            </strong>

            <small>
              Confirmed
              appointments
            </small>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon purple">
            💰
          </div>

          <div>
            <span>
              Estimated Earnings
            </span>

            <strong>
              ₹
              {totalEarnings.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Confirmed +
              completed
            </small>
          </div>
        </div>
      </section>

      {/* STATUS SYSTEM */}
      <section className="dashboard-section lawyer-status-section">

        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              AVAILABILITY CONTROL
            </span>

            <h2>
              Lawyer Status
            </h2>

            <p>
              Control how clients
              see your current
              availability.
            </p>
          </div>

          <div
            className={`lawyer-current-status lawyer-current-status-${onlineStatusClass}`}
          >
            <span className="lawyer-current-status-dot" />

            <span>
              {onlineStatus}
            </span>
          </div>
        </div>

        {/* ONLINE STATUS */}
        <div className="lawyer-status-group">

          <div className="lawyer-status-group-header">
            <div>
              <h3>
                Online Availability
              </h3>

              <p>
                Tell clients whether
                you are currently
                available.
              </p>
            </div>
          </div>

          <div className="lawyer-status-options">
            {STATUS_OPTIONS.map(
              (option) => (
                <button
                  type="button"
                  key={
                    option.value
                  }
                  className={`lawyer-status-option ${
                    onlineStatus ===
                    option.value
                      ? "active"
                      : ""
                  } lawyer-status-${option.value
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                  onClick={() =>
                    handleOnlineStatusChange(
                      option.value
                    )
                  }
                >
                  <span className="lawyer-status-option-icon">
                    {
                      option.icon
                    }
                  </span>

                  <span className="lawyer-status-option-text">
                    <strong>
                      {
                        option.title
                      }
                    </strong>

                    <small>
                      {
                        option.description
                      }
                    </small>
                  </span>

                  {onlineStatus ===
                    option.value && (
                    <span className="lawyer-status-check">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* APPOINTMENT STATUS */}
        <div className="lawyer-status-group">

          <div className="lawyer-status-group-header">
            <div>
              <h3>
                Appointment
                Availability
              </h3>

              <p>
                Control whether
                clients can request
                new appointments.
              </p>
            </div>
          </div>

          <div className="lawyer-status-options appointment-status-options">
            {APPOINTMENT_STATUS_OPTIONS.map(
              (option) => (
                <button
                  type="button"
                  key={
                    option.value
                  }
                  className={`lawyer-status-option ${
                    appointmentStatus ===
                    option.value
                      ? "active"
                      : ""
                  } lawyer-appointment-status-${option.value
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                  onClick={() =>
                    handleAppointmentStatusChange(
                      option.value
                    )
                  }
                >
                  <span className="lawyer-status-option-icon">
                    {
                      option.icon
                    }
                  </span>

                  <span className="lawyer-status-option-text">
                    <strong>
                      {
                        option.title
                      }
                    </strong>

                    <small>
                      {
                        option.description
                      }
                    </small>
                  </span>

                  {appointmentStatus ===
                    option.value && (
                    <span className="lawyer-status-check">
                      ✓
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* CURRENT STATUS SUMMARY */}
        <div className="lawyer-status-summary">

          <div className="lawyer-status-summary-main">
            <div
              className={`lawyer-summary-status-icon lawyer-summary-status-${onlineStatusClass}`}
            >
              {onlineStatus ===
              "Online"
                ? "🟢"
                : onlineStatus ===
                  "Away"
                ? "🟡"
                : "⚫"}
            </div>

            <div>
              <strong>
                {onlineStatus}
              </strong>

              <span>
                {
                  appointmentStatus
                }
              </span>
            </div>
          </div>

          <div className="lawyer-status-summary-time">
            <span>
              Last updated
            </span>

            <strong>
              {
                formatLastUpdated()
              }
            </strong>
          </div>
        </div>
      </section>

      {/* OVERVIEW GRID */}
      <div className="dashboard-overview-grid">

        {/* APPOINTMENT OVERVIEW */}
        <section className="dashboard-section">

          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-eyebrow">
                APPOINTMENTS
              </span>

              <h2>
                Appointment Overview
              </h2>

              <p>
                Current appointment
                statistics.
              </p>
            </div>
          </div>

          <div className="lawyer-overview-list">

            <div className="lawyer-overview-row">
              <span>
                <i className="overview-dot pending" />
                Pending
              </span>

              <strong>
                {
                  pendingAppointments.length
                }
              </strong>
            </div>

            <div className="lawyer-overview-row">
              <span>
                <i className="overview-dot confirmed" />
                Confirmed
              </span>

              <strong>
                {
                  confirmedAppointments.length
                }
              </strong>
            </div>

            <div className="lawyer-overview-row">
              <span>
                <i className="overview-dot completed" />
                Completed
              </span>

              <strong>
                {
                  completedAppointments.length
                }
              </strong>
            </div>

            <div className="lawyer-overview-row">
              <span>
                <i className="overview-dot rejected" />
                Rejected
              </span>

              <strong>
                {
                  rejectedAppointments.length
                }
              </strong>
            </div>

            <div className="lawyer-overview-row">
              <span>
                <i className="overview-dot cancelled" />
                Cancelled
              </span>

              <strong>
                {
                  cancelledAppointments.length
                }
              </strong>
            </div>
          </div>
        </section>

        {/* EARNINGS */}
        <section className="dashboard-section">

          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-eyebrow">
                FINANCIALS
              </span>

              <h2>
                Earnings
              </h2>

              <p>
                Appointment-based
                earnings overview.
              </p>
            </div>
          </div>

          <div className="earnings-grid">

            <div className="earnings-card">
              <span>
                Total Earnings
              </span>

              <strong>
                ₹
                {totalEarnings.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="earnings-card">
              <span>
                This Month
              </span>

              <strong>
                ₹
                {monthlyEarnings.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="earnings-card">
              <span>
                Paid Appointments
              </span>

              <strong>
                {
                  appointments.filter(
                    (appointment) =>
                      [
                        "Confirmed",
                        "Completed",
                      ].includes(
                        getAppointmentStatus(
                          appointment
                        )
                      )
                  ).length
                }
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* STATISTICS */}
      <section className="dashboard-section">

        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              PERFORMANCE
            </span>

            <h2>
              Appointment
              Statistics
            </h2>

            <p>
              Breakdown of your
              appointment statuses.
            </p>
          </div>
        </div>

        <div className="statistics-chart">
          {statistics.map(
            (stat) => {
              const maximum =
                Math.max(
                  ...statistics.map(
                    (item) =>
                      item.value
                  ),
                  1
                );

              const height =
                stat.value ===
                0
                  ? 6
                  : Math.max(
                      15,
                      (stat.value /
                        maximum) *
                        100
                    );

              return (
                <div
                  className="statistics-bar-wrapper"
                  key={
                    stat.label
                  }
                >
                  <div className="statistics-value">
                    {
                      stat.value
                    }
                  </div>

                  <div className="statistics-bar-container">
                    <div
                      className={`statistics-bar ${stat.className}`}
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <span>
                    {
                      stat.label
                    }
                  </span>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* PROFILE */}
      <section className="dashboard-section lawyer-profile-section">

        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              PROFILE
            </span>

            <h2>
              Lawyer Profile
            </h2>

            <p>
              Manage the information
              shown to clients.
            </p>
          </div>

          <button
            className="lawyer-btn lawyer-btn-primary"
            onClick={() =>
              navigate(
                "/lawyer-profile-manage"
              )
            }
          >
            Manage Profile
          </button>
        </div>

        <div className="lawyer-profile-card">

          <div className="lawyer-profile-avatar">
            {currentLawyer.name
              ?.charAt(0)
              ?.toUpperCase() ||
              "L"}
          </div>

          <div className="lawyer-profile-info">
            <h3>
              {
                currentLawyer.name
              }
            </h3>

            <p>
              {
                currentLawyer.specialization
              }
            </p>

            <div className="lawyer-profile-meta">
              <span>
                📍{" "}
                {
                  currentLawyer.location
                }
              </span>

              <span>
                ✉️{" "}
                {
                  currentLawyer.email
                }
              </span>

              <span>
                💰 ₹
                {Number(
                  currentLawyer.consultationFee ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>

          <div className="lawyer-profile-actions">

            <button
              className="lawyer-btn lawyer-btn-secondary"
              onClick={() =>
                navigate(
                  "/manage-availability"
                )
              }
            >
              Manage Availability
            </button>

            <button
              className="lawyer-btn lawyer-btn-secondary"
              onClick={() =>
                navigate(
                  `/lawyer/${currentLawyer.id}`
                )
              }
            >
              Public Profile
            </button>
          </div>
        </div>
      </section>

      {/* APPOINTMENTS */}
      <section className="dashboard-section">

        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              APPOINTMENT MANAGEMENT
            </span>

            <h2>
              My Appointments
            </h2>

            <p>
              Manage your client
              appointments.
            </p>
          </div>
        </div>

        <div className="appointment-toolbar">

          <div className="appointment-tabs">
            {[
              "Today",
              "Pending",
              "Upcoming",
              "Past",
              "All",
            ].map(
              (section) => (
                <button
                  key={
                    section
                  }
                  className={
                    activeAppointmentSection ===
                    section
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveAppointmentSection(
                      section
                    )
                  }
                >
                  {section}

                  {section ===
                    "Pending" &&
                    pendingAppointments.length >
                      0 && (
                      <span>
                        {
                          pendingAppointments.length
                        }
                      </span>
                    )}
                </button>
              )
            )}
          </div>

          <div className="appointment-filters">

            <input
              type="text"
              className="appointment-search"
              placeholder="Search client, email, phone or reason..."
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
            />

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        <div className="appointment-list">

          {filteredAppointments.length ===
          0 ? (
            <div className="lawyer-empty-state">

              <div className="lawyer-empty-state-icon">
                📅
              </div>

              <h3>
                No appointments
                found
              </h3>

              <p>
                There are no
                appointments
                matching your
                current filters.
              </p>
            </div>
          ) : (
            filteredAppointments.map(
              (
                appointment
              ) => {
                const status =
                  getAppointmentStatus(
                    appointment
                  );

                return (
                  <div
                    className="appointment-card"
                    key={
                      appointment.id
                    }
                  >

                    <div className="appointment-card-top">

                      <div className="appointment-client">

                        <div className="appointment-client-avatar">
                          {getClientName(
                            appointment
                          )
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3>
                            {getClientName(
                              appointment
                            )}
                          </h3>

                          <p>
                            {getClientEmail(
                              appointment
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`status-badge status-${status
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {
                          status
                        }
                      </span>
                    </div>

                    <div className="appointment-info-grid">

                      <div>
                        <span>
                          Date &
                          Time
                        </span>

                        <strong>
                          {formatDateTime(
                            getAppointmentDate(
                              appointment
                            ),
                            getAppointmentTime(
                              appointment
                            )
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Consultation
                        </span>

                        <strong>
                          {getConsultationType(
                            appointment
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Reason
                        </span>

                        <strong>
                          {getAppointmentReason(
                            appointment
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Fee
                        </span>

                        <strong>
                          ₹
                          {getAppointmentFee(
                            appointment
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="appointment-card-actions">

                      <button
                        className="lawyer-btn lawyer-btn-secondary"
                        onClick={() =>
                          setSelectedClient(
                            appointment
                          )
                        }
                      >
                        Client Details
                      </button>

                      <button
                        className="lawyer-btn lawyer-btn-secondary"
                        onClick={() =>
                          setSelectedAppointment(
                            appointment
                          )
                        }
                      >
                        View Details
                      </button>

                      {status ===
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
                            Confirm
                          </button>

                          <button
                            className="lawyer-btn lawyer-btn-danger"
                            onClick={() =>
                              handleReject(
                                appointment
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {status ===
                        "Confirmed" && (
                        <>
                          <button
                            className="lawyer-btn lawyer-btn-primary"
                            onClick={() =>
                              openReschedule(
                                appointment
                              )
                            }
                          >
                            Reschedule
                          </button>

                          <button
                            className="lawyer-btn lawyer-btn-success"
                            onClick={() =>
                              handleComplete(
                                appointment
                              )
                            }
                          >
                            Complete
                          </button>

                          <button
                            className="lawyer-btn lawyer-btn-danger"
                            onClick={() =>
                              handleCancel(
                                appointment
                              )
                            }
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </section>

      {/* CLIENT MODAL */}
      {selectedClient && (
        <div
          className="dashboard-modal-overlay"
          onClick={() =>
            setSelectedClient(
              null
            )
          }
        >
          <div
            className="dashboard-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="dashboard-modal-header">

              <div>
                <span>
                  CLIENT
                </span>

                <h2>
                  Client Details
                </h2>
              </div>

              <button
                className="dashboard-modal-close"
                onClick={() =>
                  setSelectedClient(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="dashboard-modal-body">

              <div className="client-modal-profile">

                <div className="client-modal-avatar">
                  {getClientName(
                    selectedClient
                  )
                    .charAt(
                      0
                    )
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {getClientName(
                      selectedClient
                    )}
                  </h3>

                  <p>
                    Client
                  </p>
                </div>
              </div>

              <div className="modal-details-grid">

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {getClientEmail(
                      selectedClient
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {getClientPhone(
                      selectedClient
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Appointment
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      getAppointmentDate(
                        selectedClient
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Appointment
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      getAppointmentTime(
                        selectedClient
                      )
                    )}
                  </strong>
                </div>

                <div className="modal-detail-full">
                  <span>
                    Reason
                  </span>

                  <strong>
                    {getAppointmentReason(
                      selectedClient
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="dashboard-modal-footer">

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

      {/* APPOINTMENT MODAL */}
      {selectedAppointment && (
        <div
          className="dashboard-modal-overlay"
          onClick={() =>
            setSelectedAppointment(
              null
            )
          }
        >
          <div
            className="dashboard-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="dashboard-modal-header">

              <div>
                <span>
                  APPOINTMENT
                </span>

                <h2>
                  Appointment
                  Details
                </h2>
              </div>

              <button
                className="dashboard-modal-close"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="dashboard-modal-body">

              <div className="appointment-detail-status-row">

                <span>
                  Status
                </span>

                <span
                  className={`status-badge status-${getAppointmentStatus(
                    selectedAppointment
                  )
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                >
                  {
                    getAppointmentStatus(
                      selectedAppointment
                    )
                  }
                </span>
              </div>

              <div className="modal-details-grid">

                <div>
                  <span>
                    Client
                  </span>

                  <strong>
                    {getClientName(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {getClientEmail(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {getClientPhone(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Consultation
                    Type
                  </span>

                  <strong>
                    {getConsultationType(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      getAppointmentDate(
                        selectedAppointment
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      getAppointmentTime(
                        selectedAppointment
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Consultation
                    Fee
                  </span>

                  <strong>
                    ₹
                    {getAppointmentFee(
                      selectedAppointment
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="modal-detail-full">
                  <span>
                    Reason
                  </span>

                  <strong>
                    {getAppointmentReason(
                      selectedAppointment
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="dashboard-modal-footer">

              {getAppointmentStatus(
                selectedAppointment
              ) ===
                "Pending" && (
                <>
                  <button
                    className="lawyer-btn lawyer-btn-success"
                    onClick={() => {
                      handleConfirm(
                        selectedAppointment
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    className="lawyer-btn lawyer-btn-danger"
                    onClick={() => {
                      handleReject(
                        selectedAppointment
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Reject
                  </button>
                </>
              )}

              {getAppointmentStatus(
                selectedAppointment
              ) ===
                "Confirmed" && (
                <>
                  <button
                    className="lawyer-btn lawyer-btn-primary"
                    onClick={() => {
                      openReschedule(
                        selectedAppointment
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Reschedule
                  </button>

                  <button
                    className="lawyer-btn lawyer-btn-success"
                    onClick={() => {
                      handleComplete(
                        selectedAppointment
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Complete
                  </button>

                  <button
                    className="lawyer-btn lawyer-btn-danger"
                    onClick={() => {
                      handleCancel(
                        selectedAppointment
                      );

                      setSelectedAppointment(
                        null
                      );
                    }}
                  >
                    Cancel
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

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal &&
        rescheduleAppointment && (
          <div
            className="dashboard-modal-overlay"
            onClick={() =>
              setShowRescheduleModal(
                false
              )
            }
          >
            <div
              className="dashboard-modal reschedule-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="dashboard-modal-header">

                <div>
                  <span>
                    APPOINTMENT
                  </span>

                  <h2>
                    Reschedule
                    Appointment
                  </h2>
                </div>

                <button
                  className="dashboard-modal-close"
                  onClick={() =>
                    setShowRescheduleModal(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleRescheduleSubmit
                }
              >

                <div className="dashboard-modal-body">

                  <div className="reschedule-client-summary">

                    <strong>
                      {getClientName(
                        rescheduleAppointment
                      )}
                    </strong>

                    <span>
                      Current:{" "}
                      {formatDateTime(
                        getAppointmentDate(
                          rescheduleAppointment
                        ),
                        getAppointmentTime(
                          rescheduleAppointment
                        )
                      )}
                    </span>
                  </div>

                  <div className="reschedule-form-grid">

                    <div className="form-field">

                      <label htmlFor="reschedule-date">
                        New Date
                      </label>

                      <input
                        id="reschedule-date"
                        type="date"
                        value={
                          rescheduleDate
                        }
                        min={
                          getTodayString()
                        }
                        onChange={(
                          event
                        ) =>
                          setRescheduleDate(
                            event
                              .target
                              .value
                          )
                        }
                        required
                      />
                    </div>

                    <div className="form-field">

                      <label htmlFor="reschedule-time">
                        New Time
                      </label>

                      <input
                        id="reschedule-time"
                        type="time"
                        value={
                          rescheduleTime
                        }
                        onChange={(
                          event
                        ) =>
                          setRescheduleTime(
                            event
                              .target
                              .value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="reschedule-note">

                    <span>
                      ℹ️
                    </span>

                    <p>
                      The new time
                      must be in
                      the future and
                      cannot conflict
                      with another
                      pending or
                      confirmed
                      appointment.
                    </p>
                  </div>
                </div>

                <div className="dashboard-modal-footer">

                  <button
                    type="button"
                    className="lawyer-btn lawyer-btn-secondary"
                    onClick={() =>
                      setShowRescheduleModal(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="lawyer-btn lawyer-btn-primary"
                  >
                    Save New
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

export default LawyerDashboard;