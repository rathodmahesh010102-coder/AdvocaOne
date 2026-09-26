import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function UserProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Get logged-in user
  const getLoggedInUser = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("advocaOneLoggedInUser") || "null"
        ) || null
      );
    } catch {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const loggedInEmail =
    loggedInUser?.email?.trim().toLowerCase() || "";

  // Load current client's profile
  useEffect(() => {
    if (!loggedInEmail) {
      return;
    }

    try {
      const allProfiles =
        JSON.parse(
          localStorage.getItem("advocaOneUserProfiles") || "{}"
        ) || {};

      const savedProfile = allProfiles[loggedInEmail];

      if (savedProfile) {
        setName(savedProfile.name || "");
        setEmail(savedProfile.email || loggedInEmail);
        setPhone(savedProfile.phone || "");
      } else {
        // First-time profile
        setName(loggedInUser?.name || "");
        setEmail(loggedInUser?.email || "");
        setPhone(loggedInUser?.phone || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);

      setName(loggedInUser?.name || "");
      setEmail(loggedInUser?.email || "");
      setPhone(loggedInUser?.phone || "");
    }
  }, [loggedInEmail]);

  // Save current client's profile
  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all profile details");
      return;
    }

    if (!loggedInEmail) {
      alert("User session not found. Please login again.");
      return;
    }

    try {
      const allProfiles =
        JSON.parse(
          localStorage.getItem("advocaOneUserProfiles") || "{}"
        ) || {};

      const profile = {
        name: name.trim(),
        email: loggedInEmail,
        phone: phone.trim(),
      };

      // Save profile using logged-in client's email
      allProfiles[loggedInEmail] = profile;

      localStorage.setItem(
        "advocaOneUserProfiles",
        JSON.stringify(allProfiles)
      );

      // Keep logged-in user information synchronized
      const currentUser = getLoggedInUser();

      if (currentUser) {
        localStorage.setItem(
          "advocaOneLoggedInUser",
          JSON.stringify({
            ...currentUser,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          })
        );
      }

      // Compatibility with old storage
      localStorage.setItem(
        "advocaOneUserProfile",
        JSON.stringify(profile)
      );

      setIsEditing(false);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Unable to save profile.");
    }
  };

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">

          <Link to="/" className="navbar-brand fw-bold">
            ⚖️ AdvocaOne
          </Link>

          <Link
            to="/dashboard"
            className="btn btn-outline-light"
          >
            ← Dashboard
          </Link>

        </div>
      </nav>

      {/* Profile */}
      <div className="container py-5">

        <div className="profile-page-card">

          <div className="profile-avatar">
            👤
          </div>

          <h1 className="fw-bold">
            My Profile
          </h1>

          <p className="text-muted mb-4">
            Manage your AdvocaOne account information.
          </p>

          <div className="profile-form">

            {/* Full Name */}
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              className="form-control mb-3"
              value={name}
              disabled={!isEditing}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            {/* Email */}
            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-control mb-3"
              value={email}
              disabled={!isEditing}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            {/* Phone */}
            <label className="form-label">
              Phone Number
            </label>

            <input
              type="tel"
              className="form-control mb-4"
              value={phone}
              disabled={!isEditing}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            {/* Buttons */}
            {!isEditing ? (
              <button
                className="btn btn-primary w-100"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                className="btn btn-success w-100"
                onClick={handleSave}
              >
                💾 Save Changes
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default UserProfile;