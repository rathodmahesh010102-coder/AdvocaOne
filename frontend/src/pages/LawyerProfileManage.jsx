import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function LawyerProfileManage() {
  /* =====================================================
     GET REGISTERED LAWYERS
  ===================================================== */

  const getLawyers = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "advocaOneAdminLawyers"
          ) || "[]"
        ) || []
      );
    } catch {
      return [];
    }
  };

  /* =====================================================
     GET LOGGED-IN USER
  ===================================================== */

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "advocaOneLoggedInUser"
        ) || "null"
      );
    } catch {
      return null;
    }
  };

  const loggedInUser =
    getLoggedInUser();

  const loggedInEmail =
    loggedInUser?.email
      ?.trim()
      .toLowerCase() || "";

  /* =====================================================
     FIND CURRENT LAWYER
  ===================================================== */

  const lawyers = getLawyers();

  const currentLawyer =
    lawyers.find(
      (lawyer) =>
        lawyer.email
          ?.trim()
          .toLowerCase() ===
        loggedInEmail
    ) || null;

  /* =====================================================
     GET SAVED PROFILE
  ===================================================== */

  const getSavedProfile = () => {
    try {
      const profiles = JSON.parse(
        localStorage.getItem(
          "advocaOneLawyerProfiles"
        ) || "{}"
      );

      return (
        profiles[loggedInEmail] ||
        null
      );
    } catch {
      return null;
    }
  };

  const savedProfile =
    getSavedProfile();

  /* =====================================================
     PROFILE STATE
  ===================================================== */

  const [profile, setProfile] =
    useState({
      name:
        savedProfile?.name ||
        currentLawyer?.name ||
        loggedInUser?.name ||
        "Lawyer",

      specialization:
        savedProfile?.specialization ||
        currentLawyer?.specialization ||
        "Not Selected",

      experience:
        savedProfile?.experience ??
        currentLawyer?.experience ??
        "0",

      barCouncilNumber:
        savedProfile?.barCouncilNumber ||
        currentLawyer?.barCouncilNumber ||
        "",

      enrollmentNumber:
        savedProfile?.enrollmentNumber ||
        currentLawyer?.enrollmentNumber ||
        "",

      education:
        savedProfile?.education ||
        currentLawyer?.education ||
        "LLB",

      languages:
        savedProfile?.languages ||
        currentLawyer?.languages ||
        "English, Hindi, Marathi",

      city:
        savedProfile?.city ||
        currentLawyer?.city ||
        "Pune",

      address:
        savedProfile?.address ||
        currentLawyer?.address ||
        "",

      consultationFee:
        savedProfile?.consultationFee ??
        currentLawyer?.fee ??
        "0",

      bio:
        savedProfile?.bio ||
        currentLawyer?.bio ||
        "Experienced legal professional providing legal consultation and assistance to clients.",

      onlineStatus:
        savedProfile?.onlineStatus ||
        currentLawyer?.onlineStatus ||
        "Offline",

      appointmentStatus:
        savedProfile?.appointmentStatus ||
        currentLawyer?.appointmentStatus ||
        "Accepting Appointments",

      nextAvailable:
        savedProfile?.nextAvailable ||
        currentLawyer?.nextAvailable ||
        "Contact for availability",
    });

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setProfile(
      (previousProfile) => ({
        ...previousProfile,
        [name]: value,
      })
    );

    setSaved(false);
    setError("");
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile = () => {
    /* Validate lawyer name */

    if (!profile.name.trim()) {
      setError(
        "Please enter lawyer name."
      );
      return;
    }

    /* Validate specialization */

    if (
      !profile.specialization ||
      profile.specialization ===
        "Not Selected"
    ) {
      setError(
        "Please select a specialization."
      );
      return;
    }

    /* Validate experience */

    if (
      profile.experience === "" ||
      Number(profile.experience) < 0
    ) {
      setError(
        "Please enter valid experience."
      );
      return;
    }

    /* Validate consultation fee */

    if (
      profile.consultationFee === "" ||
      Number(profile.consultationFee) < 0
    ) {
      setError(
        "Please enter valid consultation fee."
      );
      return;
    }

    /* Make sure logged-in lawyer exists */

    if (!loggedInEmail) {
      setError(
        "Logged-in lawyer account not found. Please login again."
      );
      return;
    }

    /* =================================================
       GET CURRENT LAWYERS
    ================================================= */

    const lawyers = getLawyers();

    const lawyerId =
      currentLawyer?.id ||
      Date.now();

    /* =================================================
       CREATE UPDATED LAWYER DATA
    ================================================= */

    const lawyerData = {
      id: lawyerId,

      name: profile.name.trim(),

      email:
        currentLawyer?.email ||
        loggedInUser?.email ||
        loggedInEmail,

      phone:
        currentLawyer?.phone ||
        loggedInUser?.phone ||
        "",

      specialization:
        profile.specialization,

      city:
        profile.city.trim(),

      experience:
        Number(profile.experience),

      fee:
        Number(
          profile.consultationFee
        ),

      barCouncilNumber:
        profile.barCouncilNumber.trim(),

      enrollmentNumber:
        profile.enrollmentNumber.trim(),

      education:
        profile.education.trim(),

      languages:
        profile.languages.trim(),

      address:
        profile.address.trim(),

      bio:
        profile.bio.trim(),

      status:
        currentLawyer?.status ||
        "Pending",

      onlineStatus:
        profile.onlineStatus,

      appointmentStatus:
        profile.appointmentStatus,

      nextAvailable:
        profile.nextAvailable.trim(),

      slots:
        currentLawyer?.slots || [],
    };

    /* =================================================
       UPDATE LAWYER LIST
    ================================================= */

    let updatedLawyers;

    if (currentLawyer) {
      updatedLawyers =
        lawyers.map(
          (lawyer) =>
            lawyer.id ===
            currentLawyer.id
              ? lawyerData
              : lawyer
        );
    } else {
      updatedLawyers = [
        ...lawyers,
        lawyerData,
      ];
    }

    localStorage.setItem(
      "advocaOneAdminLawyers",
      JSON.stringify(
        updatedLawyers
      )
    );

    /* =================================================
       SAVE PROFILE PER LAWYER EMAIL
    ================================================= */

    let allProfiles = {};

    try {
      allProfiles =
        JSON.parse(
          localStorage.getItem(
            "advocaOneLawyerProfiles"
          ) || "{}"
        ) || {};
    } catch {
      allProfiles = {};
    }

    allProfiles[
      loggedInEmail
    ] = {
      ...profile,
      name: profile.name.trim(),
      city: profile.city.trim(),
      experience: Number(
        profile.experience
      ),
      consultationFee: Number(
        profile.consultationFee
      ),
    };

    localStorage.setItem(
      "advocaOneLawyerProfiles",
      JSON.stringify(
        allProfiles
      )
    );

    /* =================================================
       UPDATE CURRENT LOGIN USER NAME
    ================================================= */

    const updatedLoggedInUser = {
      ...(loggedInUser || {}),
      name: profile.name.trim(),
      email:
        loggedInUser?.email ||
        loggedInEmail,
      role:
        loggedInUser?.role ||
        "Lawyer",
    };

    localStorage.setItem(
      "advocaOneLoggedInUser",
      JSON.stringify(
        updatedLoggedInUser
      )
    );

    /* =================================================
       UPDATE OLD GLOBAL PROFILE FOR COMPATIBILITY
       This can be removed later after full frontend
       migration.
    ================================================= */

    localStorage.setItem(
      "advocaOneLawyerProfile",
      JSON.stringify({
        ...profile,
        name: profile.name.trim(),
        city: profile.city.trim(),
        experience: Number(
          profile.experience
        ),
        consultationFee: Number(
          profile.consultationFee
        ),
        email: loggedInEmail,
        id: lawyerId,
      })
    );

    /* Notify other components */

    window.dispatchEvent(
      new Event("storage")
    );

    /* Success */

    setSaved(true);
    setError("");

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="lawyer-dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

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

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="container py-5">

        <div className="mb-4">

          <h1 className="fw-bold">
            Manage Lawyer Profile
          </h1>

          <p className="text-muted">
            Update your professional information
            and consultation details.
          </p>

        </div>

        <div className="card shadow-sm p-4">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <h4 className="fw-bold mb-4">
            👤 Basic Information
          </h4>

          <div className="row g-3">

            {/* Name */}

            <div className="col-md-6">

              <label className="form-label">
                Lawyer Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={profile.name}
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Specialization */}

            <div className="col-md-6">

              <label className="form-label">
                Specialization
              </label>

              <select
                name="specialization"
                className="form-select"
                value={
                  profile.specialization
                }
                onChange={
                  handleChange
                }
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

            {/* Experience */}

            <div className="col-md-4">

              <label className="form-label">
                Experience (Years)
              </label>

              <input
                type="number"
                min="0"
                name="experience"
                className="form-control"
                value={
                  profile.experience
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Consultation Fee */}

            <div className="col-md-4">

              <label className="form-label">
                Consultation Fee (₹)
              </label>

              <input
                type="number"
                min="0"
                name="consultationFee"
                className="form-control"
                value={
                  profile.consultationFee
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* City */}

            <div className="col-md-4">

              <label className="form-label">
                City
              </label>

              <input
                type="text"
                name="city"
                className="form-control"
                value={
                  profile.city
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Bar Council */}

            <div className="col-md-6">

              <label className="form-label">
                Bar Council Number
              </label>

              <input
                type="text"
                name="barCouncilNumber"
                className="form-control"
                value={
                  profile.barCouncilNumber
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Enrollment */}

            <div className="col-md-6">

              <label className="form-label">
                Enrollment Number
              </label>

              <input
                type="text"
                name="enrollmentNumber"
                className="form-control"
                value={
                  profile.enrollmentNumber
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Education */}

            <div className="col-md-6">

              <label className="form-label">
                Education
              </label>

              <input
                type="text"
                name="education"
                className="form-control"
                value={
                  profile.education
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Languages */}

            <div className="col-md-6">

              <label className="form-label">
                Languages
              </label>

              <input
                type="text"
                name="languages"
                className="form-control"
                value={
                  profile.languages
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Address */}

            <div className="col-12">

              <label className="form-label">
                Office Address
              </label>

              <input
                type="text"
                name="address"
                className="form-control"
                value={
                  profile.address
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          <hr className="my-4" />

          {/* =================================================
              ABOUT LAWYER
          ================================================= */}

          <h4 className="fw-bold mb-4">
            📝 About Lawyer
          </h4>

          <textarea
            name="bio"
            className="form-control"
            rows="5"
            placeholder="Write something about your legal experience and services..."
            value={profile.bio}
            onChange={
              handleChange
            }
          />

          <hr className="my-4" />

          {/* =================================================
              AVAILABILITY STATUS
          ================================================= */}

          <h4 className="fw-bold mb-4">
            🟢 Availability Status
          </h4>

          <div className="row g-3">

            {/* Online Status */}

            <div className="col-md-6">

              <label className="form-label">
                Online Status
              </label>

              <select
                name="onlineStatus"
                className="form-select"
                value={
                  profile.onlineStatus
                }
                onChange={
                  handleChange
                }
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

            {/* Appointment Status */}

            <div className="col-md-6">

              <label className="form-label">
                Appointment Status
              </label>

              <select
                name="appointmentStatus"
                className="form-select"
                value={
                  profile.appointmentStatus
                }
                onChange={
                  handleChange
                }
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

          {/* Next Available */}

          <div className="mt-3">

            <label className="form-label">
              Next Available
            </label>

            <input
              type="text"
              name="nextAvailable"
              className="form-control"
              placeholder="Example: Tomorrow 10:00 AM"
              value={
                profile.nextAvailable
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* Error */}

          {error && (
            <div className="alert alert-danger mt-4 mb-0">
              ❌ {error}
            </div>
          )}

          {/* Save */}

          <button
            className="btn btn-success btn-lg w-100 mt-4"
            onClick={
              saveProfile
            }
          >
            💾 Save Profile
          </button>

          {/* Saved */}

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