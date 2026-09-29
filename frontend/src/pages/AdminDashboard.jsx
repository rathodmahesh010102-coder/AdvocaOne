import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [activeSection, setActiveSection] = useState("overview");

  const [lawyers, setLawyers] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showLawyerDetails, setShowLawyerDetails] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  /* Lawyer filters */
  const [lawyerSearch, setLawyerSearch] = useState("");
  const [lawyerStatusFilter, setLawyerStatusFilter] = useState("All");
  const [lawyerAccountFilter, setLawyerAccountFilter] = useState("All");
  const [lawyerPracticeFilter, setLawyerPracticeFilter] = useState("All");
  const [lawyerCityFilter, setLawyerCityFilter] = useState("All");

  /* User filters */
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");

  /* Appointment filters */
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("All");
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState("All");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState("");

  /* =========================================================
     DEFAULT DATA
  ========================================================= */

  const defaultLawyers = [
    {
      id: 1,
      name: "Adv. Rahul Sharma",
      email: "rahul@advocaone.com",
      phone: "9876543210",
      specialization: "Criminal Law",
      city: "Pune",
      experience: 8,
      fee: 1000,
      status: "Approved",
      accountStatus: "Active",
      documents: {
        barCouncilCertificate: "Uploaded",
        identityProof: "Uploaded",
        degreeCertificate: "Uploaded",
      },
    },
    {
      id: 2,
      name: "Adv. Priya Patil",
      email: "priya@advocaone.com",
      phone: "9876543211",
      specialization: "Family Law",
      city: "Mumbai",
      experience: 6,
      fee: 800,
      status: "Approved",
      accountStatus: "Active",
      documents: {
        barCouncilCertificate: "Uploaded",
        identityProof: "Uploaded",
        degreeCertificate: "Uploaded",
      },
    },
    {
      id: 3,
      name: "Adv. Amit Deshmukh",
      email: "amit@advocaone.com",
      phone: "9876543212",
      specialization: "Corporate Law",
      city: "Pune",
      experience: 10,
      fee: 1500,
      status: "Pending",
      accountStatus: "Active",
      documents: {
        barCouncilCertificate: "Uploaded",
        identityProof: "Uploaded",
        degreeCertificate: "Pending",
      },
    },
    {
      id: 4,
      name: "Adv. Sneha Joshi",
      email: "sneha@advocaone.com",
      phone: "9876543213",
      specialization: "Cyber Law",
      city: "Nashik",
      experience: 5,
      fee: 900,
      status: "Rejected",
      accountStatus: "Active",
      documents: {
        barCouncilCertificate: "Uploaded",
        identityProof: "Uploaded",
        degreeCertificate: "Uploaded",
      },
    },
    {
      id: 5,
      name: "Adv. Vikram Singh",
      email: "vikram@advocaone.com",
      phone: "9876543214",
      specialization: "Property Law",
      city: "Delhi",
      experience: 12,
      fee: 2000,
      status: "Approved",
      accountStatus: "Active",
      documents: {
        barCouncilCertificate: "Uploaded",
        identityProof: "Uploaded",
        degreeCertificate: "Uploaded",
      },
    },
  ];

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadLawyers = () => {
    try {
      const savedLawyers = JSON.parse(
        localStorage.getItem("advocaOneAdminLawyers") || "[]"
      );

      if (Array.isArray(savedLawyers) && savedLawyers.length > 0) {
        const normalizedLawyers = savedLawyers.map((lawyer, index) => ({
          id: lawyer.id || index + 1,
          name: lawyer.name || "Unnamed Lawyer",
          email: lawyer.email || "",
          phone: lawyer.phone || "",
          specialization:
            lawyer.specialization || lawyer.practiceArea || "Not Selected",
          city: lawyer.city || "Not Selected",
          experience: lawyer.experience || 0,
          fee: lawyer.fee || 0,
          status: lawyer.status || "Pending",
          accountStatus: lawyer.accountStatus || "Active",
          documents: lawyer.documents || {
            barCouncilCertificate: "Not Uploaded",
            identityProof: "Not Uploaded",
            degreeCertificate: "Not Uploaded",
          },
        }));

        setLawyers(normalizedLawyers);
      } else {
        setLawyers(defaultLawyers);

        localStorage.setItem(
          "advocaOneAdminLawyers",
          JSON.stringify(defaultLawyers)
        );
      }
    } catch (error) {
      console.error("Error loading lawyers:", error);
      setLawyers(defaultLawyers);
    }
  };

  const loadUsers = () => {
    try {
      const savedAccounts = JSON.parse(
        localStorage.getItem("advocaOneAccounts") || "[]"
      );

      if (!Array.isArray(savedAccounts)) {
        setUsers([]);
        return;
      }

      const formattedUsers = savedAccounts.map((account, index) => ({
        id: account.id || index + 1,
        name: account.name || account.fullName || "User",
        email: account.email || "",
        phone: account.phone || "",
        role: account.role || "Client",
        status: account.status || "Active",
        createdAt: account.createdAt || "",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  };

  const loadAppointments = () => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem("advocaOneBookings") || "[]"
      );

      if (!Array.isArray(savedBookings)) {
        setAppointments([]);
        return;
      }

      const formattedAppointments = savedBookings.map((booking, index) => ({
        ...booking,

        id: booking.id || `appointment-${index + 1}`,

        client:
          booking.client ||
          booking.userName ||
          booking.clientName ||
          booking.name ||
          "Client",

        clientEmail: booking.clientEmail || booking.userEmail || "",

        lawyer:
          booking.lawyerName ||
          booking.lawyer ||
          booking.lawyerName ||
          "Lawyer",

        lawyerEmail: booking.lawyerEmail || "",

        date: booking.date || booking.bookingDate || "",

        time: booking.time || booking.bookingTime || "",

        type:
          booking.type ||
          booking.consultationType ||
          booking.mode ||
          "Online",

        status: booking.status || "Pending",

        fee: booking.fee || booking.amount || 0,
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
    }
  };

  const loadAllData = () => {
    loadLawyers();
    loadUsers();
    loadAppointments();
  };

  useEffect(() => {
    loadAllData();

    const handleStorage = () => loadAllData();
    const handleCustomUpdate = () => loadAllData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    window.addEventListener(
      "advocaOneDataUpdated",
      handleCustomUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
      window.removeEventListener(
        "advocaOneDataUpdated",
        handleCustomUpdate
      );
    };
  }, []);

  /* =========================================================
     DATA UPDATE EVENT
  ========================================================= */

  const notifyDataUpdate = () => {
    window.dispatchEvent(new Event("advocaOneDataUpdated"));
  };

  /* =========================================================
     LAWYER ACTIONS
  ========================================================= */

  const updateLawyerStatus = (id, status) => {
    try {
      const updatedLawyers = lawyers.map((lawyer) =>
        String(lawyer.id) === String(id)
          ? {
              ...lawyer,
              status,
            }
          : lawyer
      );

      setLawyers(updatedLawyers);

      localStorage.setItem(
        "advocaOneAdminLawyers",
        JSON.stringify(updatedLawyers)
      );

      /*
        Also update lawyer account if the lawyer exists
        inside advocaOneAccounts.
      */

      try {
        const accounts = JSON.parse(
          localStorage.getItem("advocaOneAccounts") || "[]"
        );

        const updatedAccounts = accounts.map((account) => {
          const lawyer = updatedLawyers.find(
            (item) =>
              String(item.id) === String(account.id) ||
              item.email?.toLowerCase() === account.email?.toLowerCase()
          );

          if (!lawyer) return account;

          return {
            ...account,
            verificationStatus: status,
            lawyerStatus: status,
          };
        });

        localStorage.setItem(
          "advocaOneAccounts",
          JSON.stringify(updatedAccounts)
        );
      } catch (accountError) {
        console.error(accountError);
      }

      const updatedSelected = updatedLawyers.find(
        (lawyer) => String(lawyer.id) === String(id)
      );

      if (updatedSelected) {
        setSelectedLawyer(updatedSelected);
      }

      notifyDataUpdate();
    } catch (error) {
      console.error("Error updating lawyer status:", error);
    }
  };

  const toggleLawyerAccountStatus = (id) => {
    try {
      const updatedLawyers = lawyers.map((lawyer) =>
        String(lawyer.id) === String(id)
          ? {
              ...lawyer,
              accountStatus:
                lawyer.accountStatus === "Inactive"
                  ? "Active"
                  : "Inactive",
            }
          : lawyer
      );

      setLawyers(updatedLawyers);

      localStorage.setItem(
        "advocaOneAdminLawyers",
        JSON.stringify(updatedLawyers)
      );

      const updatedSelected = updatedLawyers.find(
        (lawyer) => String(lawyer.id) === String(id)
      );

      if (updatedSelected) {
        setSelectedLawyer(updatedSelected);
      }

      notifyDataUpdate();
    } catch (error) {
      console.error("Error toggling lawyer account:", error);
    }
  };

  /* =========================================================
     USER ACTIONS
  ========================================================= */

  const updateUserStatus = (id) => {
    const targetUser = users.find(
      (user) => String(user.id) === String(id)
    );

    if (!targetUser) return;

    /*
      Prevent accidental admin self-deactivation.
    */

    const loggedInUser = JSON.parse(
      localStorage.getItem("advocaOneLoggedInUser") || "null"
    );

    if (
      loggedInUser &&
      loggedInUser.email &&
      targetUser.email &&
      loggedInUser.email.toLowerCase() ===
        targetUser.email.toLowerCase() &&
      targetUser.role === "Admin"
    ) {
      alert("Admin account cannot be deactivated.");
      return;
    }

    const updatedUsers = users.map((user) =>
      String(user.id) === String(id)
        ? {
            ...user,
            status:
              user.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : user
    );

    setUsers(updatedUsers);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("advocaOneAccounts") || "[]"
      );

      const updatedAccounts = accounts.map((account) => {
        const matchingUser = updatedUsers.find(
          (user) =>
            String(user.id) === String(account.id) ||
            user.email?.toLowerCase() ===
              account.email?.toLowerCase()
        );

        return matchingUser
          ? {
              ...account,
              status: matchingUser.status,
            }
          : account;
      });

      localStorage.setItem(
        "advocaOneAccounts",
        JSON.stringify(updatedAccounts)
      );

      notifyDataUpdate();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  /* =========================================================
     APPOINTMENT ACTIONS
  ========================================================= */

  const updateAppointmentStatus = (id, status) => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem("advocaOneBookings") || "[]"
      );

      if (!Array.isArray(savedBookings)) return;

      const updatedBookings = savedBookings.map(
        (booking, index) => {
          const bookingId =
            booking.id || `appointment-${index + 1}`;

          return String(bookingId) === String(id)
            ? {
                ...booking,
                id: bookingId,
                status,
              }
            : booking;
        }
      );

      localStorage.setItem(
        "advocaOneBookings",
        JSON.stringify(updatedBookings)
      );

      loadAppointments();

      if (
        selectedAppointment &&
        String(selectedAppointment.id) === String(id)
      ) {
        setSelectedAppointment({
          ...selectedAppointment,
          status,
        });
      }

      notifyDataUpdate();
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("advocaOneLoggedInUser");

    navigate("/login");
  };

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const practiceAreas = useMemo(
    () => [
      ...new Set(
        lawyers
          .map((lawyer) => lawyer.specialization)
          .filter(Boolean)
      ),
    ],
    [lawyers]
  );

  const cities = useMemo(
    () => [
      ...new Set(
        lawyers
          .map((lawyer) => lawyer.city)
          .filter(Boolean)
      ),
    ],
    [lawyers]
  );

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const searchText = lawyerSearch
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        lawyer.name?.toLowerCase().includes(searchText) ||
        lawyer.email?.toLowerCase().includes(searchText) ||
        lawyer.phone?.toLowerCase().includes(searchText) ||
        lawyer.city?.toLowerCase().includes(searchText) ||
        lawyer.specialization
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        lawyerStatusFilter === "All" ||
        lawyer.status === lawyerStatusFilter;

      const matchesAccount =
        lawyerAccountFilter === "All" ||
        (lawyer.accountStatus || "Active") ===
          lawyerAccountFilter;

      const matchesPractice =
        lawyerPracticeFilter === "All" ||
        lawyer.specialization === lawyerPracticeFilter;

      const matchesCity =
        lawyerCityFilter === "All" ||
        lawyer.city === lawyerCityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAccount &&
        matchesPractice &&
        matchesCity
      );
    });
  }, [
    lawyers,
    lawyerSearch,
    lawyerStatusFilter,
    lawyerAccountFilter,
    lawyerPracticeFilter,
    lawyerCityFilter,
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = userSearch
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.phone?.toLowerCase().includes(searchText);

      const matchesRole =
        userRoleFilter === "All" ||
        user.role === userRoleFilter;

      const matchesStatus =
        userStatusFilter === "All" ||
        user.status === userStatusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    userSearch,
    userRoleFilter,
    userStatusFilter,
  ]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const searchText = appointmentSearch
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        appointment.client
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.lawyer
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.date
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.time
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.type
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        appointmentStatusFilter === "All" ||
        appointment.status === appointmentStatusFilter;

      const matchesType =
        appointmentTypeFilter === "All" ||
        appointment.type === appointmentTypeFilter;

      const matchesDate =
        appointmentDateFilter === "" ||
        appointment.date === appointmentDateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDate
      );
    });
  }, [
    appointments,
    appointmentSearch,
    appointmentStatusFilter,
    appointmentTypeFilter,
    appointmentDateFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalLawyers = lawyers.length;

  const pendingLawyers = lawyers.filter(
    (lawyer) => lawyer.status === "Pending"
  ).length;

  const approvedLawyers = lawyers.filter(
    (lawyer) => lawyer.status === "Approved"
  ).length;

  const rejectedLawyers = lawyers.filter(
    (lawyer) => lawyer.status === "Rejected"
  ).length;

  const activeLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.status === "Approved" &&
      lawyer.accountStatus !== "Inactive"
  ).length;

  const inactiveLawyers = lawyers.filter(
    (lawyer) => lawyer.accountStatus === "Inactive"
  ).length;

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "Cancelled"
  ).length;

  const rejectedAppointments = appointments.filter(
    (appointment) => appointment.status === "Rejected"
  ).length;

  const totalEarnings = appointments
    .filter(
      (appointment) =>
        appointment.status === "Confirmed" ||
        appointment.status === "Completed"
    )
    .reduce(
      (total, appointment) =>
        total + Number(appointment.fee || 0),
      0
    );

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearLawyerFilters = () => {
    setLawyerSearch("");
    setLawyerStatusFilter("All");
    setLawyerAccountFilter("All");
    setLawyerPracticeFilter("All");
    setLawyerCityFilter("All");
  };

  const clearUserFilters = () => {
    setUserSearch("");
    setUserRoleFilter("All");
    setUserStatusFilter("All");
  };

  const clearAppointmentFilters = () => {
    setAppointmentSearch("");
    setAppointmentStatusFilter("All");
    setAppointmentTypeFilter("All");
    setAppointmentDateFilter("");
  };

  /* =========================================================
     OPEN DETAILS
  ========================================================= */

  const openLawyerDetails = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowLawyerDetails(true);
    setShowDocuments(false);
  };

  const openDocuments = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowDocuments(true);
    setShowLawyerDetails(false);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  /* =========================================================
     STATUS BADGES
  ========================================================= */

  const getStatusClass = (status) => {
    const normalized = status
      ?.toLowerCase()
      .replace(/\s+/g, "-");

    return `admin-status-badge admin-status-${normalized}`;
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const menuItems = [
    {
      id: "overview",
      icon: "📊",
      label: "Dashboard",
    },
    {
      id: "lawyers",
      icon: "⚖️",
      label: "Lawyers",
      count: totalLawyers,
    },
    {
      id: "users",
      icon: "👥",
      label: "Users",
      count: totalUsers,
    },
    {
      id: "appointments",
      icon: "📅",
      label: "Appointments",
      count: totalAppointments,
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <div className="admin-logo-icon">
            ⚖️
          </div>

          <div>
            <h2>AdvocaOne</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <div className="admin-sidebar-label">
          MAIN MENU
        </div>

        <nav className="admin-sidebar-menu">

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar-item ${
                activeSection === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection(item.id)
              }
            >
              <span className="admin-sidebar-icon">
                {item.icon}
              </span>

              <span className="admin-sidebar-text">
                {item.label}
              </span>

              {item.count !== undefined && (
                <span className="admin-sidebar-count">
                  {item.count}
                </span>
              )}
            </button>
          ))}

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-sidebar-item"
            onClick={() => navigate("/")}
          >
            <span className="admin-sidebar-icon">
              🏠
            </span>

            <span className="admin-sidebar-text">
              Main Website
            </span>
          </button>

          <button
            className="admin-sidebar-item admin-logout-item"
            onClick={handleLogout}
          >
            <span className="admin-sidebar-icon">
              🚪
            </span>

            <span className="admin-sidebar-text">
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-main-content">

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div>
            <div className="admin-breadcrumb">
              Admin /{" "}
              {activeSection === "overview"
                ? "Dashboard"
                : activeSection.charAt(0).toUpperCase() +
                  activeSection.slice(1)}
            </div>
          </div>

          <div className="admin-topbar-right">

            <button
              className="admin-icon-button"
              onClick={loadAllData}
              title="Refresh data"
            >
              🔄
            </button>

            <div className="admin-profile">

              <div className="admin-profile-avatar">
                A
              </div>

              <div>
                <strong>Administrator</strong>
                <span>Super Admin</span>
              </div>

            </div>

          </div>

        </header>

        <div className="admin-content">

          {/* =================================================
              DASHBOARD OVERVIEW
          ================================================= */}

          {activeSection === "overview" && (
            <>
              <div className="admin-page-header">

                <div>
                  <span className="admin-eyebrow">
                    CONTROL CENTER
                  </span>

                  <h1>Admin Dashboard</h1>

                  <p>
                    Monitor lawyers, users and
                    appointments from one place.
                  </p>
                </div>

                <button
                  className="admin-primary-button"
                  onClick={loadAllData}
                >
                  🔄 Refresh Dashboard
                </button>

              </div>

              {/* KPI CARDS */}

              <div className="admin-kpi-grid">

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    ⚖️
                  </div>

                  <div>
                    <span>Total Lawyers</span>
                    <strong>{totalLawyers}</strong>
                    <small>
                      {pendingLawyers} pending verification
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    ⏳
                  </div>

                  <div>
                    <span>Pending Verification</span>
                    <strong>{pendingLawyers}</strong>
                    <small>
                      Need admin review
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    ✅
                  </div>

                  <div>
                    <span>Approved Lawyers</span>
                    <strong>{approvedLawyers}</strong>
                    <small>
                      Verified lawyers
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    👥
                  </div>

                  <div>
                    <span>Total Users</span>
                    <strong>{totalUsers}</strong>
                    <small>
                      {activeUsers} active users
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    🟢
                  </div>

                  <div>
                    <span>Active Lawyers</span>
                    <strong>{activeLawyers}</strong>
                    <small>
                      Currently available accounts
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    📅
                  </div>

                  <div>
                    <span>Total Appointments</span>
                    <strong>{totalAppointments}</strong>
                    <small>
                      {pendingAppointments} pending
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    💰
                  </div>

                  <div>
                    <span>Estimated Earnings</span>
                    <strong>
                      ₹{totalEarnings.toLocaleString("en-IN")}
                    </strong>
                    <small>
                      Confirmed + completed
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon">
                    ❌
                  </div>

                  <div>
                    <span>Rejected Lawyers</span>
                    <strong>{rejectedLawyers}</strong>
                    <small>
                      Verification rejected
                    </small>
                  </div>
                </div>

              </div>

              {/* DASHBOARD GRID */}

              <div className="admin-dashboard-grid">

                {/* APPOINTMENT STATUS */}

                <div className="admin-card">

                  <div className="admin-card-header">

                    <div>
                      <h3>Appointment Overview</h3>
                      <p>
                        Current appointment status
                      </p>
                    </div>

                    <button
                      className="admin-link-button"
                      onClick={() =>
                        setActiveSection("appointments")
                      }
                    >
                      View All →
                    </button>

                  </div>

                  <div className="admin-status-list">

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot pending-dot" />
                        Pending
                      </span>
                      <strong>
                        {pendingAppointments}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot confirmed-dot" />
                        Confirmed
                      </span>
                      <strong>
                        {confirmedAppointments}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot completed-dot" />
                        Completed
                      </span>
                      <strong>
                        {completedAppointments}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot cancelled-dot" />
                        Cancelled
                      </span>
                      <strong>
                        {cancelledAppointments}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot rejected-dot" />
                        Rejected
                      </span>
                      <strong>
                        {rejectedAppointments}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* LAWYER STATUS */}

                <div className="admin-card">

                  <div className="admin-card-header">

                    <div>
                      <h3>Lawyer Verification</h3>
                      <p>
                        Verification summary
                      </p>
                    </div>

                    <button
                      className="admin-link-button"
                      onClick={() =>
                        setActiveSection("lawyers")
                      }
                    >
                      Manage →
                    </button>

                  </div>

                  <div className="admin-status-list">

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot pending-dot" />
                        Pending
                      </span>
                      <strong>
                        {pendingLawyers}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot confirmed-dot" />
                        Approved
                      </span>
                      <strong>
                        {approvedLawyers}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot rejected-dot" />
                        Rejected
                      </span>
                      <strong>
                        {rejectedLawyers}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot completed-dot" />
                        Active
                      </span>
                      <strong>
                        {activeLawyers}
                      </strong>
                    </div>

                    <div className="admin-status-row">
                      <span>
                        <i className="status-dot cancelled-dot" />
                        Inactive
                      </span>
                      <strong>
                        {inactiveLawyers}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="admin-card">

                <div className="admin-card-header">

                  <div>
                    <h3>Quick Actions</h3>
                    <p>
                      Frequently used administration tools
                    </p>
                  </div>

                </div>

                <div className="admin-quick-actions">

                  <button
                    onClick={() =>
                      setActiveSection("lawyers")
                    }
                  >
                    <span>⚖️</span>
                    <strong>Manage Lawyers</strong>
                    <small>
                      Verify and manage lawyers
                    </small>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSection("users")
                    }
                  >
                    <span>👥</span>
                    <strong>Manage Users</strong>
                    <small>
                      Manage client accounts
                    </small>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSection("appointments")
                    }
                  >
                    <span>📅</span>
                    <strong>Appointments</strong>
                    <small>
                      Manage booking requests
                    </small>
                  </button>

                </div>

              </div>
            </>
          )}

          {/* =================================================
              LAWYER MANAGEMENT
          ================================================= */}

          {activeSection === "lawyers" && (
            <>
              <div className="admin-page-header">

                <div>
                  <span className="admin-eyebrow">
                    LAWYER MANAGEMENT
                  </span>

                  <h1>Lawyers</h1>

                  <p>
                    Verify, activate and manage lawyer
                    accounts.
                  </p>
                </div>

                <div className="admin-header-stat">
                  <strong>{filteredLawyers.length}</strong>
                  <span>Showing Lawyers</span>
                </div>

              </div>

              {/* FILTER CARD */}

              <div className="admin-filter-card">

                <div className="admin-filter-grid">

                  <div className="admin-input-group admin-search-input">
                    <label>Search</label>

                    <input
                      type="text"
                      placeholder="Name, email, phone, city..."
                      value={lawyerSearch}
                      onChange={(e) =>
                        setLawyerSearch(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Verification</label>

                    <select
                      value={lawyerStatusFilter}
                      onChange={(e) =>
                        setLawyerStatusFilter(e.target.value)
                      }
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Account</label>

                    <select
                      value={lawyerAccountFilter}
                      onChange={(e) =>
                        setLawyerAccountFilter(e.target.value)
                      }
                    >
                      <option value="All">All Accounts</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Practice Area</label>

                    <select
                      value={lawyerPracticeFilter}
                      onChange={(e) =>
                        setLawyerPracticeFilter(e.target.value)
                      }
                    >
                      <option value="All">
                        All Practice Areas
                      </option>

                      {practiceAreas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>City</label>

                    <select
                      value={lawyerCityFilter}
                      onChange={(e) =>
                        setLawyerCityFilter(e.target.value)
                      }
                    >
                      <option value="All">
                        All Cities
                      </option>

                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-filter-button-wrapper">

                    <button
                      className="admin-secondary-button"
                      onClick={clearLawyerFilters}
                    >
                      ✕ Clear Filters
                    </button>

                  </div>

                </div>

              </div>

              {/* LAWYER TABLE */}

              <div className="admin-table-card">

                <div className="admin-table-header">

                  <div>
                    <h3>Lawyer Directory</h3>
                    <p>
                      {filteredLawyers.length} lawyer
                      {filteredLawyers.length !== 1
                        ? "s"
                        : ""}{" "}
                      found
                    </p>
                  </div>

                </div>

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>Lawyer</th>
                        <th>Practice Area</th>
                        <th>City</th>
                        <th>Experience</th>
                        <th>Fee</th>
                        <th>Verification</th>
                        <th>Account</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredLawyers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="admin-empty-state"
                          >
                            <div>
                              <span>🔎</span>
                              <h3>No lawyers found</h3>
                              <p>
                                Try changing your filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredLawyers.map((lawyer) => (
                          <tr key={lawyer.id}>

                            <td>

                              <div className="admin-person">

                                <div className="admin-person-avatar">
                                  {lawyer.name
                                    ?.replace("Adv. ", "")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {lawyer.name}
                                  </strong>

                                  <span>
                                    {lawyer.email ||
                                      "No email"}
                                  </span>
                                </div>

                              </div>

                            </td>

                            <td>
                              {lawyer.specialization ||
                                "Not Selected"}
                            </td>

                            <td>
                              {lawyer.city ||
                                "Not Selected"}
                            </td>

                            <td>
                              {lawyer.experience
                                ? `${lawyer.experience} yrs`
                                : "—"}
                            </td>

                            <td>
                              ₹
                              {Number(
                                lawyer.fee || 0
                              ).toLocaleString("en-IN")}
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  lawyer.status
                                )}
                              >
                                {lawyer.status}
                              </span>
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  lawyer.accountStatus ||
                                    "Active"
                                )}
                              >
                                {lawyer.accountStatus ||
                                  "Active"}
                              </span>
                            </td>

                            <td>

                              <div className="admin-actions">

                                <button
                                  className="admin-action-button view"
                                  onClick={() =>
                                    openLawyerDetails(
                                      lawyer
                                    )
                                  }
                                  title="View details"
                                >
                                  👁️
                                </button>

                                <button
                                  className="admin-action-button document"
                                  onClick={() =>
                                    openDocuments(lawyer)
                                  }
                                  title="Documents"
                                >
                                  📄
                                </button>

                                {lawyer.status !==
                                  "Approved" && (
                                  <button
                                    className="admin-action-button approve"
                                    onClick={() =>
                                      updateLawyerStatus(
                                        lawyer.id,
                                        "Approved"
                                      )
                                    }
                                    title="Approve"
                                  >
                                    ✓
                                  </button>
                                )}

                                {lawyer.status !==
                                  "Rejected" && (
                                  <button
                                    className="admin-action-button reject"
                                    onClick={() =>
                                      updateLawyerStatus(
                                        lawyer.id,
                                        "Rejected"
                                      )
                                    }
                                    title="Reject"
                                  >
                                    ✕
                                  </button>
                                )}

                                <button
                                  className="admin-action-button account"
                                  onClick={() =>
                                    toggleLawyerAccountStatus(
                                      lawyer.id
                                    )
                                  }
                                  title={
                                    lawyer.accountStatus ===
                                    "Inactive"
                                      ? "Activate"
                                      : "Deactivate"
                                  }
                                >
                                  {lawyer.accountStatus ===
                                  "Inactive"
                                    ? "🔓"
                                    : "🔒"}
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            </>
          )}

          {/* =================================================
              USER MANAGEMENT
          ================================================= */}

          {activeSection === "users" && (
            <>
              <div className="admin-page-header">

                <div>
                  <span className="admin-eyebrow">
                    USER MANAGEMENT
                  </span>

                  <h1>Users</h1>

                  <p>
                    Manage client and registered user
                    accounts.
                  </p>
                </div>

                <div className="admin-header-stat">
                  <strong>{filteredUsers.length}</strong>
                  <span>Showing Users</span>
                </div>

              </div>

              {/* USER FILTERS */}

              <div className="admin-filter-card">

                <div className="admin-filter-grid">

                  <div className="admin-input-group admin-search-input">
                    <label>Search</label>

                    <input
                      type="text"
                      placeholder="Name, email or phone..."
                      value={userSearch}
                      onChange={(e) =>
                        setUserSearch(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Role</label>

                    <select
                      value={userRoleFilter}
                      onChange={(e) =>
                        setUserRoleFilter(e.target.value)
                      }
                    >
                      <option value="All">All Roles</option>
                      <option value="Client">Client</option>
                      <option value="Lawyer">Lawyer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Status</label>

                    <select
                      value={userStatusFilter}
                      onChange={(e) =>
                        setUserStatusFilter(e.target.value)
                      }
                    >
                      <option value="All">
                        All Status
                      </option>
                      <option value="Active">
                        Active
                      </option>
                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div className="admin-filter-button-wrapper">

                    <button
                      className="admin-secondary-button"
                      onClick={clearUserFilters}
                    >
                      ✕ Clear Filters
                    </button>

                  </div>

                </div>

              </div>

              {/* USER TABLE */}

              <div className="admin-table-card">

                <div className="admin-table-header">

                  <div>
                    <h3>User Directory</h3>
                    <p>
                      {filteredUsers.length} user
                      {filteredUsers.length !== 1
                        ? "s"
                        : ""}{" "}
                      found
                    </p>
                  </div>

                </div>

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="admin-empty-state"
                          >
                            <div>
                              <span>👥</span>
                              <h3>No users found</h3>
                              <p>
                                Try changing your filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>

                            <td>

                              <div className="admin-person">

                                <div className="admin-person-avatar">
                                  {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {user.name}
                                  </strong>

                                  <span>
                                    {user.role}
                                  </span>
                                </div>

                              </div>

                            </td>

                            <td>
                              {user.email || "—"}
                            </td>

                            <td>
                              {user.phone || "—"}
                            </td>

                            <td>
                              <span className="admin-role-badge">
                                {user.role}
                              </span>
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  user.status
                                )}
                              >
                                {user.status}
                              </span>
                            </td>

                            <td>

                              <div className="admin-actions">

                                <button
                                  className="admin-action-button view"
                                  onClick={() =>
                                    openUserDetails(user)
                                  }
                                  title="View details"
                                >
                                  👁️
                                </button>

                                <button
                                  className="admin-action-button account"
                                  onClick={() =>
                                    updateUserStatus(
                                      user.id
                                    )
                                  }
                                  title={
                                    user.status ===
                                    "Inactive"
                                      ? "Activate"
                                      : "Deactivate"
                                  }
                                >
                                  {user.status ===
                                  "Inactive"
                                    ? "🔓"
                                    : "🔒"}
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            </>
          )}

          {/* =================================================
              APPOINTMENT MANAGEMENT
          ================================================= */}

          {activeSection === "appointments" && (
            <>
              <div className="admin-page-header">

                <div>
                  <span className="admin-eyebrow">
                    APPOINTMENT MANAGEMENT
                  </span>

                  <h1>Appointments</h1>

                  <p>
                    Monitor and manage all consultation
                    bookings.
                  </p>
                </div>

                <div className="admin-header-stat">
                  <strong>
                    {filteredAppointments.length}
                  </strong>
                  <span>Showing Appointments</span>
                </div>

              </div>

              {/* APPOINTMENT FILTERS */}

              <div className="admin-filter-card">

                <div className="admin-filter-grid">

                  <div className="admin-input-group admin-search-input">
                    <label>Search</label>

                    <input
                      type="text"
                      placeholder="Client, lawyer, date, time..."
                      value={appointmentSearch}
                      onChange={(e) =>
                        setAppointmentSearch(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Status</label>

                    <select
                      value={appointmentStatusFilter}
                      onChange={(e) =>
                        setAppointmentStatusFilter(
                          e.target.value
                        )
                      }
                    >
                      <option value="All">
                        All Status
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
                      <option value="Cancelled">
                        Cancelled
                      </option>
                      <option value="Rejected">
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Consultation Type</label>

                    <select
                      value={appointmentTypeFilter}
                      onChange={(e) =>
                        setAppointmentTypeFilter(
                          e.target.value
                        )
                      }
                    >
                      <option value="All">
                        All Types
                      </option>
                      <option value="Online">
                        Online
                      </option>
                      <option value="Offline">
                        Offline
                      </option>
                      <option value="Video">
                        Video
                      </option>
                      <option value="In-Person">
                        In-Person
                      </option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>Date</label>

                    <input
                      type="date"
                      value={appointmentDateFilter}
                      onChange={(e) =>
                        setAppointmentDateFilter(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="admin-filter-button-wrapper">

                    <button
                      className="admin-secondary-button"
                      onClick={
                        clearAppointmentFilters
                      }
                    >
                      ✕ Clear Filters
                    </button>

                  </div>

                </div>

              </div>

              {/* APPOINTMENT TABLE */}

              <div className="admin-table-card">

                <div className="admin-table-header">

                  <div>
                    <h3>Appointment Directory</h3>

                    <p>
                      {filteredAppointments.length}{" "}
                      appointment
                      {filteredAppointments.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      found
                    </p>
                  </div>

                </div>

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Lawyer</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Fee</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredAppointments.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="admin-empty-state"
                          >
                            <div>
                              <span>📅</span>
                              <h3>
                                No appointments found
                              </h3>
                              <p>
                                Try changing your
                                filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map(
                          (appointment) => (
                            <tr key={appointment.id}>

                              <td>

                                <div className="admin-person">

                                  <div className="admin-person-avatar">
                                    {appointment.client
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {
                                        appointment.client
                                      }
                                    </strong>

                                    <span>
                                      {appointment.clientEmail ||
                                        "Client"}
                                    </span>
                                  </div>

                                </div>

                              </td>

                              <td>
                                {appointment.lawyer}
                              </td>

                              <td>
                                {appointment.date ||
                                  "—"}
                              </td>

                              <td>
                                {appointment.time ||
                                  "—"}
                              </td>

                              <td>
                                <span className="admin-role-badge">
                                  {appointment.type}
                                </span>
                              </td>

                              <td>
                                ₹
                                {Number(
                                  appointment.fee || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td>
                                <span
                                  className={getStatusClass(
                                    appointment.status
                                  )}
                                >
                                  {
                                    appointment.status
                                  }
                                </span>
                              </td>

                              <td>

                                <div className="admin-actions">

                                  <button
                                    className="admin-action-button view"
                                    onClick={() =>
                                      openAppointmentDetails(
                                        appointment
                                      )
                                    }
                                    title="View details"
                                  >
                                    👁️
                                  </button>

                                  {appointment.status ===
                                    "Pending" && (
                                    <>
                                      <button
                                        className="admin-action-button approve"
                                        onClick={() =>
                                          updateAppointmentStatus(
                                            appointment.id,
                                            "Confirmed"
                                          )
                                        }
                                        title="Confirm"
                                      >
                                        ✓
                                      </button>

                                      <button
                                        className="admin-action-button reject"
                                        onClick={() =>
                                          updateAppointmentStatus(
                                            appointment.id,
                                            "Rejected"
                                          )
                                        }
                                        title="Reject"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  )}

                                  {appointment.status ===
                                    "Confirmed" && (
                                    <button
                                      className="admin-action-button reject"
                                      onClick={() =>
                                        updateAppointmentStatus(
                                          appointment.id,
                                          "Cancelled"
                                        )
                                      }
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  )}

                                </div>

                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            </>
          )}

        </div>
      </main>

      {/* =====================================================
          LAWYER DETAILS MODAL
      ===================================================== */}

      {showLawyerDetails && selectedLawyer && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowLawyerDetails(false)
          }
        >
          <div
            className="admin-details-panel"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <span className="admin-eyebrow">
                  LAWYER PROFILE
                </span>

                <h2>Lawyer Details</h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowLawyerDetails(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="admin-profile-large">

              <div className="admin-large-avatar">
                {selectedLawyer.name
                  ?.replace("Adv. ", "")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>{selectedLawyer.name}</h3>

                <p>
                  {selectedLawyer.specialization ||
                    "Not Selected"}
                </p>

                <span
                  className={getStatusClass(
                    selectedLawyer.status
                  )}
                >
                  {selectedLawyer.status}
                </span>
              </div>

            </div>

            <div className="admin-details-grid">

              <div>
                <span>Email</span>
                <strong>
                  {selectedLawyer.email || "—"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {selectedLawyer.phone || "—"}
                </strong>
              </div>

              <div>
                <span>Practice Area</span>
                <strong>
                  {selectedLawyer.specialization ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>City</span>
                <strong>
                  {selectedLawyer.city || "—"}
                </strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedLawyer.experience
                    ? `${selectedLawyer.experience} years`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Consultation Fee</span>
                <strong>
                  ₹
                  {Number(
                    selectedLawyer.fee || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Account Status</span>
                <strong>
                  {selectedLawyer.accountStatus ||
                    "Active"}
                </strong>
              </div>

            </div>

            <div className="admin-modal-actions">

              {selectedLawyer.status !== "Approved" && (
                <button
                  className="admin-primary-button"
                  onClick={() =>
                    updateLawyerStatus(
                      selectedLawyer.id,
                      "Approved"
                    )
                  }
                >
                  ✓ Approve Lawyer
                </button>
              )}

              {selectedLawyer.status !== "Rejected" && (
                <button
                  className="admin-danger-button"
                  onClick={() =>
                    updateLawyerStatus(
                      selectedLawyer.id,
                      "Rejected"
                    )
                  }
                >
                  ✕ Reject Lawyer
                </button>
              )}

              <button
                className="admin-secondary-button"
                onClick={() =>
                  toggleLawyerAccountStatus(
                    selectedLawyer.id
                  )
                }
              >
                {selectedLawyer.accountStatus ===
                "Inactive"
                  ? "🔓 Activate Account"
                  : "🔒 Deactivate Account"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          DOCUMENTS MODAL
      ===================================================== */}

      {showDocuments && selectedLawyer && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowDocuments(false)}
        >
          <div
            className="admin-details-panel"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <span className="admin-eyebrow">
                  VERIFICATION
                </span>

                <h2>Lawyer Documents</h2>

                <p>
                  {selectedLawyer.name}
                </p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowDocuments(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="admin-document-grid">

              <div className="admin-document-card">

                <div className="admin-document-icon">
                  📜
                </div>

                <div>
                  <h3>
                    Bar Council Certificate
                  </h3>

                  <span
                    className={getStatusClass(
                      selectedLawyer.documents
                        ?.barCouncilCertificate ||
                        "Not Uploaded"
                    )}
                  >
                    {selectedLawyer.documents
                      ?.barCouncilCertificate ||
                      "Not Uploaded"}
                  </span>
                </div>

              </div>

              <div className="admin-document-card">

                <div className="admin-document-icon">
                  🪪
                </div>

                <div>
                  <h3>Identity Proof</h3>

                  <span
                    className={getStatusClass(
                      selectedLawyer.documents
                        ?.identityProof ||
                        "Not Uploaded"
                    )}
                  >
                    {selectedLawyer.documents
                      ?.identityProof ||
                      "Not Uploaded"}
                  </span>
                </div>

              </div>

              <div className="admin-document-card">

                <div className="admin-document-icon">
                  🎓
                </div>

                <div>
                  <h3>Degree Certificate</h3>

                  <span
                    className={getStatusClass(
                      selectedLawyer.documents
                        ?.degreeCertificate ||
                        "Not Uploaded"
                    )}
                  >
                    {selectedLawyer.documents
                      ?.degreeCertificate ||
                      "Not Uploaded"}
                  </span>
                </div>

              </div>

            </div>

            <div className="admin-document-note">
              <strong>Verification Note</strong>

              <p>
                Review the submitted documents before
                approving the lawyer profile.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {showUserDetails && selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowUserDetails(false)
          }
        >
          <div
            className="admin-details-panel"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <span className="admin-eyebrow">
                  USER PROFILE
                </span>

                <h2>User Details</h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowUserDetails(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="admin-profile-large">

              <div className="admin-large-avatar">
                {selectedUser.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>{selectedUser.name}</h3>

                <p>
                  {selectedUser.role}
                </p>

                <span
                  className={getStatusClass(
                    selectedUser.status
                  )}
                >
                  {selectedUser.status}
                </span>
              </div>

            </div>

            <div className="admin-details-grid">

              <div>
                <span>Name</span>
                <strong>
                  {selectedUser.name}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedUser.email || "—"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {selectedUser.phone || "—"}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {selectedUser.role}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedUser.status}
                </strong>
              </div>

              <div>
                <span>User ID</span>
                <strong>
                  {selectedUser.id}
                </strong>
              </div>

            </div>

            <div className="admin-modal-actions">

              <button
                className="admin-secondary-button"
                onClick={() =>
                  updateUserStatus(
                    selectedUser.id
                  )
                }
              >
                {selectedUser.status === "Inactive"
                  ? "🔓 Activate User"
                  : "🔒 Deactivate User"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          APPOINTMENT DETAILS MODAL
      ===================================================== */}

      {showAppointmentDetails &&
        selectedAppointment && (
          <div
            className="admin-modal-overlay"
            onClick={() =>
              setShowAppointmentDetails(false)
            }
          >
            <div
              className="admin-details-panel"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="admin-modal-header">

                <div>
                  <span className="admin-eyebrow">
                    BOOKING DETAILS
                  </span>

                  <h2>Appointment Details</h2>
                </div>

                <button
                  className="admin-modal-close"
                  onClick={() =>
                    setShowAppointmentDetails(false)
                  }
                >
                  ✕
                </button>

              </div>

              <div className="admin-details-grid">

                <div>
                  <span>Client</span>
                  <strong>
                    {selectedAppointment.client}
                  </strong>
                </div>

                <div>
                  <span>Client Email</span>
                  <strong>
                    {selectedAppointment.clientEmail ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Lawyer</span>
                  <strong>
                    {selectedAppointment.lawyer}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {selectedAppointment.date ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>
                    {selectedAppointment.time ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Consultation Type</span>
                  <strong>
                    {selectedAppointment.type}
                  </strong>
                </div>

                <div>
                  <span>Fee</span>
                  <strong>
                    ₹
                    {Number(
                      selectedAppointment.fee || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedAppointment.status}
                  </strong>
                </div>

              </div>

              <div className="admin-modal-actions">

                {selectedAppointment.status ===
                  "Pending" && (
                  <>
                    <button
                      className="admin-primary-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "Confirmed"
                        )
                      }
                    >
                      ✓ Confirm Appointment
                    </button>

                    <button
                      className="admin-danger-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "Rejected"
                        )
                      }
                    >
                      ✕ Reject Appointment
                    </button>
                  </>
                )}

                {selectedAppointment.status ===
                  "Confirmed" && (
                  <button
                    className="admin-danger-button"
                    onClick={() =>
                      updateAppointmentStatus(
                        selectedAppointment.id,
                        "Cancelled"
                      )
                    }
                  >
                    ✕ Cancel Appointment
                  </button>
                )}

              </div>

            </div>
          </div>
        )}

    </div>
  );
}

export default AdminDashboard;