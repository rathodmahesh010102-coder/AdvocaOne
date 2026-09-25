import { Routes, Route } from "react-router-dom";

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

console.log("NEW APPOVAONE APP.JSX LOADED");
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/lawyer/:id" element={<LawyerProfile />} />

      <Route path="/booking/:id" element={<Booking />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/my-bookings" element={<MyBookings />} />

      <Route path="/profile" element={<UserProfile />} />

      <Route path="/lawyer-dashboard" element={<LawyerDashboard />}/>

      <Route path="/manage-availability" element={<ManageAvailability />}/>

      <Route path="/lawyer-profile-manage" element={<LawyerProfileManage />}/>

      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route
  path="/admin-dashboard"
  element={<AdminDashboard />}
/>
    </Routes>
  );
}

export default App;