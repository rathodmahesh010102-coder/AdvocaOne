import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import LawyerProfile from "./pages/LawyerProfile";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyBookings from "./pages/MyBookings";
import UserProfile from "./pages/UserProfile";
import LawyerDashboard from "./pages/LawyerDashboard";
import ManageAvailability from "./pages/ManageAvailability";
import LawyerProfileManage from "./pages/LawyerProfileManage";
import AdminDashboard from "./pages/AdminDashboard";
import MyAppointments from "./pages/MyAppointments";

// ========================================
// GET LOGGED-IN USER
// ========================================

function getLoggedInUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("advocaOneLoggedInUser") || "null"
      ) || null
    );
  } catch {
    return null;
  }
}

// ========================================
// PROTECTED ROUTE
// ========================================

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = getLoggedInUser();

  // User is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role
  if (allowedRole && user.role !== allowedRole) {
    // Lawyer
    if (user.role === "Lawyer") {
      return <Navigate to="/lawyer-dashboard" replace />;
    }

    // Admin
    if (user.role === "Admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    // Client
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ========================================
// APP
// ========================================

function App() {
  return (
    <Routes>

      {/* ==============================
          PUBLIC ROUTES
      ============================== */}

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

      {/* ==============================
          CLIENT ROUTES
      ============================== */}

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

      {/* ==============================
          LAWYER ROUTES
      ============================== */}

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

      {/* ==============================
          ADMIN ROUTE
      ============================== */}

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==============================
          UNKNOWN ROUTE
      ============================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;