
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import LawyerProfile from "./pages/LawyerProfile";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Client Pages
import Dashboard from "./pages/Dashboard";
import MyBookings from "./pages/MyBookings";
import UserProfile from "./pages/UserProfile";
import Documents from "./pages/Documents";
import Payment from "./pages/Payment";
import LegalAssistant from "./pages/LegalAssistant";
import CaseSummary from "./pages/CaseSummary";
import NotificationSettings from "./pages/NotificationSettings";

// Lawyer Pages
import LawyerDashboard from "./pages/LawyerDashboard";
import ManageAvailability from "./pages/ManageAvailability";
import LawyerProfileManage from "./pages/LawyerProfileManage";
import MyAppointments from "./pages/MyAppointments";

// Shared Pages
import Chat from "./pages/Chat";
import VideoConsultation from "./pages/VideoConsultation";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";

// ======================================================
// GET LOGGED-IN USER
// ======================================================

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem(
      "advocaOneLoggedInUser"
    );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Unable to read logged-in user:",
      error
    );

    return null;
  }
}

// ======================================================
// NORMALIZE ROLE
// ======================================================

function normalizeRole(role) {
  if (!role) {
    return "";
  }

  return String(role).trim().toLowerCase();
}

// ======================================================
// GET DASHBOARD PATH BY ROLE
// ======================================================

function getDashboardPath(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin-dashboard";
  }

  if (normalizedRole === "lawyer") {
    return "/lawyer-dashboard";
  }

  if (
    normalizedRole === "client" ||
    normalizedRole === "user"
  ) {
    return "/dashboard";
  }

  return "/login";
}

// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = getLoggedInUser();

  // User is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Any logged-in role is allowed
  if (!allowedRole) {
    return children;
  }

  // Check user's role
  const currentRole = normalizeRole(user.role);
  const requiredRole = normalizeRole(allowedRole);

  // Correct role
  if (currentRole === requiredRole) {
    return children;
  }

  // Redirect to the correct dashboard
  return (
    <Navigate
      to={getDashboardPath(user.role)}
      replace
    />
  );
}

// ======================================================
// APP ROUTES
// ======================================================

function App() {
  return (
    <Routes>

      {/* ==============================================
          PUBLIC ROUTES
      ============================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/lawyer/:id"
        element={<LawyerProfile />}
      />

      <Route
        path="/booking/:id"
        element={<Booking />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ==============================================
          CLIENT ROUTES
      ============================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="Client">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRole="Client">
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="Client">
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute allowedRole="Client">
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute allowedRole="Client">
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/legal-assistant"
        element={
          <ProtectedRoute allowedRole="Client">
            <LegalAssistant />
          </ProtectedRoute>
        }
      />

      <Route
        path="/case-summary"
        element={
          <ProtectedRoute allowedRole="Client">
            <CaseSummary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notification-settings"
        element={
          <ProtectedRoute allowedRole="Client">
            <NotificationSettings />
          </ProtectedRoute>
        }
      />


      {/* ==============================================
          LAWYER ROUTES
      ============================================== */}

      <Route
        path="/lawyer-dashboard"
        element={
          <ProtectedRoute allowedRole="Lawyer">
            <LawyerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-availability"
        element={
          <ProtectedRoute allowedRole="Lawyer">
            <ManageAvailability />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lawyer-profile-manage"
        element={
          <ProtectedRoute allowedRole="Lawyer">
            <LawyerProfileManage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute allowedRole="Lawyer">
            <MyAppointments />
          </ProtectedRoute>
        }
      />


      {/* ==============================================
          ADMIN ROUTE
      ============================================== */}

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* ==============================================
          SHARED AUTHENTICATED ROUTES
      ============================================== */}

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/video-consultation"
        element={
          <ProtectedRoute>
            <VideoConsultation />
          </ProtectedRoute>
        }
      />


      {/* ==============================================
          UNKNOWN ROUTE
          KEEP THIS ROUTE LAST
      ============================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;