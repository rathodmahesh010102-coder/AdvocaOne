import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Client");

  const handleRegister = (e) => {
    e.preventDefault();

    // Check all fields
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      alert("Please fill all fields");
      return;
    }

    // Check phone number
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    // Check email
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    // Check password
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Only Client and Lawyer registration is allowed
    if (role !== "Client" && role !== "Lawyer") {
      alert("Invalid registration role");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Create account
    const newAccount = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: password,
      role: role,
    };

    // Load existing accounts
    let existingAccounts = [];

    try {
      existingAccounts =
        JSON.parse(
          localStorage.getItem("advocaOneAccounts") || "[]"
        ) || [];
    } catch {
      existingAccounts = [];
    }

    // Check duplicate email
    const accountExists = existingAccounts.some(
      (account) =>
        account.email?.trim().toLowerCase() === normalizedEmail
    );

    if (accountExists) {
      alert("An account with this email already exists.");
      return;
    }

    // Save account
    localStorage.setItem(
      "advocaOneAccounts",
      JSON.stringify([
        ...existingAccounts,
        newAccount,
      ])
    );

    // ========================================
    // LAWYER REGISTRATION
    // ========================================

    if (role === "Lawyer") {
      const newLawyer = {
        id: Date.now(),
        name: `Adv. ${name.trim()}`,
        email: normalizedEmail,
        phone: phone.trim(),
        specialization: "Not Selected",
        city: "Not Selected",
        experience: 0,
        fee: 0,
        barCouncilNumber: "",
        enrollmentNumber: "",
        status: "Pending",
        onlineStatus: "Offline",
        appointmentStatus: "Accepting Appointments",
        nextAvailable: "Contact for availability",
        slots: [],
      };

      let existingLawyers = [];

      try {
        existingLawyers =
          JSON.parse(
            localStorage.getItem(
              "advocaOneAdminLawyers"
            ) || "[]"
          ) || [];
      } catch {
        existingLawyers = [];
      }

      localStorage.setItem(
        "advocaOneAdminLawyers",
        JSON.stringify([
          ...existingLawyers,
          newLawyer,
        ])
      );

      alert(
        "Lawyer registration submitted successfully. Your profile is pending admin verification."
      );

      navigate("/login");
      return;
    }

    // ========================================
    // CLIENT REGISTRATION
    // ========================================

    let clientProfiles = {};

    try {
      clientProfiles =
        JSON.parse(
          localStorage.getItem(
            "advocaOneUserProfiles"
          ) || "{}"
        ) || {};
    } catch {
      clientProfiles = {};
    }

    // Save profile using client email as unique key
    clientProfiles[normalizedEmail] = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
    };

    localStorage.setItem(
      "advocaOneUserProfiles",
      JSON.stringify(clientProfiles)
    );

    // Keep old storage for compatibility
    localStorage.setItem(
      "advocaOneUserProfile",
      JSON.stringify({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
      })
    );

    alert("Client registration successful!");

    navigate("/login");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          ⚖️
        </div>

        <h2>Create Account</h2>

        <p className="text-muted">
          Join AdvocaOne today
        </p>

        <form onSubmit={handleRegister}>

          {/* Full Name */}

          <label className="form-label">
            Full Name
          </label>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}

          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Phone */}

          <label className="form-label">
            Phone Number
          </label>

          <input
            type="tel"
            className="form-control mb-3"
            placeholder="Enter your 10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Role */}

          <label className="form-label">
            Register As
          </label>

          <select
            className="form-select mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Client">
              Client
            </option>

            <option value="Lawyer">
              Lawyer
            </option>
          </select>

          {/* Password */}

          <label className="form-label">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control mb-3"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Show / Hide Password */}

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword
              ? "🙈 Hide Password"
              : "👁️ Show Password"}
          </button>

          {/* Register */}

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Create Account
          </button>

        </form>

        <p className="mt-4">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        <Link
          to="/"
          className="btn btn-outline-secondary w-100 mt-2"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Register;