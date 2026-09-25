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

    if (!name || !email || !phone || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (role === "Lawyer") {
      const newLawyer = {
        id: Date.now(),
        name: `Adv. ${name}`,
        email: email,
        phone: phone,
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
        slots: []
      };

      const existingLawyers =
        JSON.parse(
          localStorage.getItem("advocaOneAdminLawyers")
        ) || [];

      const updatedLawyers = [
        ...existingLawyers,
        newLawyer
      ];

      localStorage.setItem(
        "advocaOneAdminLawyers",
        JSON.stringify(updatedLawyers)
      );

      alert(
        "Lawyer registration submitted successfully. Your profile is pending admin verification."
      );

      navigate("/login");
      return;
    }

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

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword
              ? "🙈 Hide Password"
              : "👁️ Show Password"}
          </button>

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