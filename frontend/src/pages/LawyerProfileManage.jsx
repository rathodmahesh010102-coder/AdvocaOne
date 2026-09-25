
import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function LawyerProfileManage() {
  const getLawyers = () => {
    try {
      return JSON.parse(
        localStorage.getItem("advocaOneAdminLawyers") || "[]"
      );
    } catch {
      return [];
    }
  };

  const lawyers = getLawyers();

  const existingLawyer = lawyers.find(
    (lawyer) => lawyer.name === "Adv. Priya Patil"
  );

  const getSavedProfile = () => {
  try {
    return JSON.parse(
      localStorage.getItem("advocaOneLawyerProfile") || "null"
    );
  } catch {
    return null;
  }
};

const savedProfile = getSavedProfile();

const currentLawyer = existingLawyer || null;

  const [profile, setProfile] = useState({
    name: currentLawyer?.name || "Adv. Priya Patil",
    specialization:
  savedProfile?.specialization ||
  currentLawyer?.specialization ||
  "Family Law",
    experience:
  savedProfile?.experience ??
  currentLawyer?.experience ??
  "7",
    barCouncilNumber: currentLawyer?.barCouncilNumber || "",
    enrollmentNumber: currentLawyer?.enrollmentNumber || "",
    education: currentLawyer?.education || "LLB",
    languages:
      currentLawyer?.languages || "English, Hindi, Marathi",
    city:
  savedProfile?.city ||
  currentLawyer?.city ||
  "Pune",
    address: currentLawyer?.address || "",
    consultationFee:
  savedProfile?.consultationFee ??
  currentLawyer?.fee ??
  "800",
    bio:
      currentLawyer?.bio ||
      "Experienced legal professional providing legal consultation and assistance to clients.",
    onlineStatus: currentLawyer?.onlineStatus || "Online",
    appointmentStatus:
      currentLawyer?.appointmentStatus ||
      "Accepting Appointments",
    nextAvailable:
      currentLawyer?.nextAvailable ||
      "Tomorrow 10:00 AM",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const saveProfile = () => {
    if (!profile.name.trim()) {
      setError("Please enter lawyer name.");
      return;
    }

    if (
      !profile.specialization ||
      profile.specialization === "Not Selected"
    ) {
      setError("Please select a specialization.");
      return;
    }

    if (
      profile.experience === "" ||
      Number(profile.experience) < 0
    ) {
      setError("Please enter valid experience.");
      return;
    }

    if (
      profile.consultationFee === "" ||
      Number(profile.consultationFee) < 0
    ) {
      setError("Please enter valid consultation fee.");
      return;
    }

    const lawyers = getLawyers();

    const lawyerId =
      currentLawyer?.id || Date.now();

    const lawyerData = {
      id: lawyerId,
      name: profile.name.trim(),
      email: currentLawyer?.email || "mahesh@test.com",
      phone: currentLawyer?.phone || "9876543210",
      specialization: profile.specialization,
      city: profile.city,
      experience: Number(profile.experience),
      fee: Number(profile.consultationFee),
      barCouncilNumber: profile.barCouncilNumber,
      enrollmentNumber: profile.enrollmentNumber,
      education: profile.education,
      languages: profile.languages,
      address: profile.address,
      bio: profile.bio,
      status: currentLawyer?.status || "Approved",
      onlineStatus: profile.onlineStatus,
      appointmentStatus: profile.appointmentStatus,
      nextAvailable: profile.nextAvailable,
      slots: currentLawyer?.slots || [],
    };

    let updatedLawyers;

    if (currentLawyer) {
      updatedLawyers = lawyers.map((lawyer) =>
        lawyer.id === currentLawyer.id
          ? lawyerData
          : lawyer
      );
    } else {
      updatedLawyers = [...lawyers, lawyerData];
    }

    localStorage.setItem(
      "advocaOneAdminLawyers",
      JSON.stringify(updatedLawyers)
    );

    localStorage.setItem(
      "advocaOneLawyerProfile",
      JSON.stringify(profile)
    );

    window.dispatchEvent(new Event("storage"));

    setSaved(true);
    setError("");

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="lawyer-dashboard-page">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <Link
            to="/lawyer-dashboard"
            className="btn btn-outline-light"
          >
            ← Lawyer Dashboard
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <div className="mb-4">
          <h1 className="fw-bold">
            Manage Lawyer Profile
          </h1>

          <p className="text-muted">
            Update your professional information and consultation details.
          </p>
        </div>

        <div className="card shadow-sm p-4">
          <h4 className="fw-bold mb-4">
            👤 Basic Information
          </h4>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Lawyer Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={profile.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Specialization
              </label>

              <select
                name="specialization"
                className="form-select"
                value={profile.specialization}
                onChange={handleChange}
              >
                <option value="Not Selected">
                  Select Specialization
                </option>
                <option value="Criminal Law">
                  Criminal Law
                </option>
                <option value="Family Law">
                  Family Law
                </option>
                <option value="Corporate Law">
                  Corporate Law
                </option>
                <option value="Property Law">
                  Property Law
                </option>
                <option value="Cyber Law">
                  Cyber Law
                </option>
                <option value="Consumer Law">
                  Consumer Law
                </option>
                <option value="Tax Law">
                  Tax Law
                </option>
                <option value="Civil Law">
                  Civil Law
                </option>
                <option value="Labor Law">
                  Labor Law
                </option>
                <option value="Constitutional Law">
                  Constitutional Law
                </option>
                <option value="Intellectual Property Law">
                  Intellectual Property Law
                </option>
                <option value="Environmental Law">
                  Environmental Law
                </option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Experience (Years)
              </label>

              <input
                type="number"
                min="0"
                name="experience"
                className="form-control"
                value={profile.experience}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Consultation Fee (₹)
              </label>

              <input
                type="number"
                min="0"
                name="consultationFee"
                className="form-control"
                value={profile.consultationFee}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                City
              </label>

              <input
                type="text"
                name="city"
                className="form-control"
                value={profile.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Bar Council Number
              </label>

              <input
                type="text"
                name="barCouncilNumber"
                className="form-control"
                value={profile.barCouncilNumber}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Enrollment Number
              </label>

              <input
                type="text"
                name="enrollmentNumber"
                className="form-control"
                value={profile.enrollmentNumber}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Education
              </label>

              <input
                type="text"
                name="education"
                className="form-control"
                value={profile.education}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Languages
              </label>

              <input
                type="text"
                name="languages"
                className="form-control"
                value={profile.languages}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label">
                Office Address
              </label>

              <input
                type="text"
                name="address"
                className="form-control"
                value={profile.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="my-4" />

          <h4 className="fw-bold mb-4">
            📝 About Lawyer
          </h4>

          <textarea
            name="bio"
            className="form-control"
            rows="5"
            placeholder="Write something about your legal experience and services..."
            value={profile.bio}
            onChange={handleChange}
          />

          <hr className="my-4" />

          <h4 className="fw-bold mb-4">
            🟢 Availability Status
          </h4>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Online Status
              </label>

              <select
                name="onlineStatus"
                className="form-select"
                value={profile.onlineStatus}
                onChange={handleChange}
              >
                <option value="Online">
                  🟢 Online
                </option>
                <option value="Away">
                  🟡 Away
                </option>
                <option value="Offline">
                  🔴 Offline
                </option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Appointment Status
              </label>

              <select
                name="appointmentStatus"
                className="form-select"
                value={profile.appointmentStatus}
                onChange={handleChange}
              >
                <option value="Accepting Appointments">
                  🟢 Accepting Appointments
                </option>
                <option value="Busy">
                  🟡 Busy
                </option>
                <option value="Not Accepting">
                  🔴 Not Accepting
                </option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">
              Next Available
            </label>

            <input
              type="text"
              name="nextAvailable"
              className="form-control"
              placeholder="Example: Tomorrow 10:00 AM"
              value={profile.nextAvailable}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="alert alert-danger mt-4 mb-0">
              ❌ {error}
            </div>
          )}

          <button
            className="btn btn-success btn-lg w-100 mt-4"
            onClick={saveProfile}
          >
            💾 Save Profile
          </button>

          {saved && (
            <div className="alert alert-success mt-3 mb-0">
              ✅ Lawyer profile saved successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LawyerProfileManage;

