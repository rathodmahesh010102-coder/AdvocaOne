import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Check fields
    if (!email.trim() || !password) {
      alert("Please enter email and password");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    // Get registered accounts
    let accounts = [];

    try {
      accounts =
        JSON.parse(
          localStorage.getItem("advocaOneAccounts") || "[]"
        ) || [];
    } catch {
      accounts = [];
    }

    // Find registered account
    const account = accounts.find(
      (item) =>
        item.email?.trim().toLowerCase() === normalizedEmail &&
        item.password === password
    );

    // ========================================
    // ADMIN LOGIN
    // ========================================

    const isAdmin =
      normalizedEmail === "admin@advocaone.com" &&
      password === "Admin@123";

    if (!account && !isAdmin) {
      alert("Invalid email or password");
      return;
    }

    // ========================================
    // ADMIN SESSION
    // ========================================

    if (isAdmin) {
      localStorage.setItem("token", "logged-in");

      localStorage.setItem(
        "advocaOneLoggedInUser",
        JSON.stringify({
          name: "Admin",
          email: "admin@advocaone.com",
          phone: "",
          role: "Admin",
        })
      );

      navigate("/admin-dashboard");
      return;
    }

    // ========================================
    // SAVE NORMAL USER SESSION
    // ========================================

    localStorage.setItem("token", "logged-in");

    localStorage.setItem(
      "advocaOneLoggedInUser",
      JSON.stringify({
        name: account.name,
        email: account.email,
        phone: account.phone || "",
        role: account.role,
      })
    );

    // ========================================
    // LAWYER LOGIN
    // ========================================

    if (account.role === "Lawyer") {
      navigate("/lawyer-dashboard");
      return;
    }

    // ========================================
    // CLIENT LOGIN
    // ========================================

    navigate("/dashboard", {
      state: {
        name: account.name,
        email: account.email,
      },
    });
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          ⚖️
        </div>

        <h2>Welcome Back</h2>

        <p className="text-muted">
          Login to your AdvocaOne account
        </p>

        <form onSubmit={handleLogin}>

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

          {/* Password */}

          <label className="form-label">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control mb-3"
            placeholder="Enter your password"
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

          {/* Login */}

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Login
          </button>

        </form>

        <p className="mt-4">
          Don't have an account?{" "}
          <Link to="/register">
            Create Account
          </Link>
        </p>

        <Link
          to="/"
          className="btn btn-outline-secondary w-100 mt-3"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;