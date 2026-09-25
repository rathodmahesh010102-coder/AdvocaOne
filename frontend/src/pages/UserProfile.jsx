import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function UserProfile() {
  const [name, setName] = useState("Mahesh Rathod");
  const [email, setEmail] = useState("mahesh@example.com");
  const [phone, setPhone] = useState("9876543210");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
  const savedProfile = localStorage.getItem(
    "advocaOneUserProfile"
  );

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);

    setName(profile.name || "");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
  }
}, []);

  const handleSave = () => {
  if (!name.trim() || !email.trim() || !phone.trim()) {
    alert("Please fill all profile details");
    return;
  }

  const profile = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
  };

  localStorage.setItem(
    "advocaOneUserProfile",
    JSON.stringify(profile)
  );

  setIsEditing(false);
  alert("Profile updated successfully!");
};
  return (
    <div className="dashboard-page">

      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            ⚖️ AdvocaOne
          </Link>

          <Link to="/dashboard" className="btn btn-outline-light">
            ← Dashboard
          </Link>
        </div>
      </nav>

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

            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              className="form-control mb-3"
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-control mb-3"
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="form-label">
              Phone Number
            </label>

            <input
              type="tel"
              className="form-control mb-4"
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
            />

            {!isEditing ? (
              <button
                className="btn btn-primary w-100"
                onClick={() => setIsEditing(true)}
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