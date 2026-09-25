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

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    navigate("/dashboard", {
  state: {
    name: email.split("@")[0],
    email: email,
  },
});
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">⚖️</div>

        <h2>Welcome Back</h2>

        <p className="text-muted">
          Login to your AdvocaOne account
        </p>

        <form onSubmit={handleLogin}>

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
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control mb-3"
            placeholder="Enter your password"
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