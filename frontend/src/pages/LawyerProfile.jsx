import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import lawyers from "../data/lawyers";
import "../App.css";

function LawyerProfile() {
  const { id } = useParams();

  const [registeredLawyers, setRegisteredLawyers] =
    useState([]);

  const [lawyerAvailabilities, setLawyerAvailabilities] =
    useState({});

  const [globalAvailability, setGlobalAvailability] =
    useState({});

  // Load lawyer data and availability
  useEffect(() => {
    try {
      const savedLawyers =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAdminLawyers"
          ) || "[]"
        ) || [];

      setRegisteredLawyers(
        Array.isArray(savedLawyers)
          ? savedLawyers
          : []
      );
    } catch (error) {
      console.error(
        "Error loading registered lawyers:",
        error
      );

      setRegisteredLawyers([]);
    }

    try {
      const savedLawyerAvailability =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAvailabilities"
          ) || "{}"
        ) || {};

      setLawyerAvailabilities(
        savedLawyerAvailability
      );
    } catch (error) {
      console.error(
        "Error loading lawyer availability:",
        error
      );

      setLawyerAvailabilities({});
    }

    // Availability for static/demo lawyers
    try {
      const savedGlobalAvailability =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAvailability"
          ) || "{}"
        ) || {};

      setGlobalAvailability(
        savedGlobalAvailability
      );
    } catch (error) {
      console.error(
        "Error loading global availability:",
        error
      );

      setGlobalAvailability({});
    }
  }, []);

  // Check whether availability contains at least one slot
  const hasAvailableSlots = (availability) => {
    if (!availability) {
      return false;
    }

    return Object.values(
      availability
    ).some(
      (slots) =>
        Array.isArray(slots) &&
        slots.length > 0
    );
  };

  // Find registered lawyer
  const registeredLawyer =
    registeredLawyers.find(
      (registeredLawyer) =>
        String(registeredLawyer.id) ===
        String(id)
    );

  // Find static/demo lawyer
  const staticLawyer =
    lawyers.find(
      (lawyer) =>
        String(lawyer.id) ===
        String(id)
    );

  // Determine current lawyer
  const lawyer = registeredLawyer
    ? {
        ...registeredLawyer,

        location:
          registeredLawyer.city &&
          registeredLawyer.city !==
            "Not Selected"
            ? registeredLawyer.city
            : "Not specified",

        consultationFee:
          Number(
            registeredLawyer.fee
          ) || 0,

        experience:
          Number(
            registeredLawyer.experience
          ) || 0,

        onlineStatus:
          registeredLawyer.onlineStatus ||
          "Offline",

        appointmentStatus:
          registeredLawyer.appointmentStatus ||
          "Accepting Appointments",

        nextAvailable:
          registeredLawyer.nextAvailable ||
          "Contact for availability",
      }
    : staticLawyer;

  // Lawyer not found
  if (!lawyer) {
    return (
      <div className="container py-5">

        <h2>
          Lawyer Not Found
        </h2>

        <Link
          to="/"
          className="btn btn-primary mt-3"
        >
          ← Back to Home
        </Link>

      </div>
    );
  }

  const isRegisteredLawyer =
    Boolean(registeredLawyer);

  // Get correct availability
  let lawyerAvailability = {};

  if (isRegisteredLawyer) {
    const lawyerEmail =
      registeredLawyer.email
        ?.trim()
        .toLowerCase() || "";

    lawyerAvailability =
      lawyerEmail
        ? lawyerAvailabilities[
            lawyerEmail
          ] || {}
        : {};
  } else {
    // Static/demo lawyer
    lawyerAvailability =
      globalAvailability;
  }

  // Determine availability
  const lawyerIsAvailable =
    hasAvailableSlots(
      lawyerAvailability
    );

  const onlineStatusClass =
    lawyer.onlineStatus ===
    "Online"
      ? "badge bg-success"
      : lawyer.onlineStatus ===
        "Away"
      ? "badge bg-warning text-dark"
      : "badge bg-danger";

  const appointmentStatusClass =
    lawyer.appointmentStatus ===
    "Accepting Appointments"
      ? "badge bg-success"
      : lawyer.appointmentStatus ===
        "Busy"
      ? "badge bg-warning text-dark"
      : "badge bg-danger";

  // Available days
  const availableDays =
    Object.entries(
      lawyerAvailability
    ).filter(
      ([, slots]) =>
        Array.isArray(slots) &&
        slots.length > 0
    );

  return (
    <div className="lawyer-profile-page">

      {/* ==============================
          NAVBAR
      ============================== */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <Link
            to="/"
            className="btn btn-outline-light"
          >
            ← Home
          </Link>

        </div>

      </nav>

      {/* ==============================
          PROFILE
      ============================== */}

      <div className="container py-5">

        <div className="card shadow-lg lawyer-profile-card">

          <div className="card-body p-4 p-md-5">

            <div className="row">

              {/* ==============================
                  LEFT SIDE
              ============================== */}

              <div className="col-md-4 text-center">

                <div className="lawyer-profile-avatar">
                  ⚖️
                </div>

                <h2 className="fw-bold mt-3">
                  {lawyer.name}
                </h2>

                <p className="text-primary fw-semibold">
                  {lawyer.specialization}
                </p>

                {/* Status */}
                <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">

                  <span
                    className={
                      onlineStatusClass
                    }
                  >

                    {lawyer.onlineStatus ===
                    "Online"
                      ? "🟢"
                      : lawyer.onlineStatus ===
                        "Away"
                      ? "🟡"
                      : "🔴"}{" "}

                    {
                      lawyer.onlineStatus
                    }

                  </span>

                  <span
                    className={
                      appointmentStatusClass
                    }
                  >

                    {lawyer.appointmentStatus ===
                    "Accepting Appointments"
                      ? "🟢"
                      : lawyer.appointmentStatus ===
                        "Busy"
                      ? "🟡"
                      : "🔴"}{" "}

                    {
                      lawyer.appointmentStatus
                    }

                  </span>

                </div>

                {/* Book Button */}
                <div className="mt-4">

                  <Link
                    to={`/booking/${lawyer.id}`}
                    className="btn btn-primary btn-lg w-100"
                  >
                    📅 Book Consultation
                  </Link>

                </div>

              </div>

              {/* ==============================
                  RIGHT SIDE
              ============================== */}

              <div className="col-md-8 mt-4 mt-md-0">

                <h3 className="fw-bold mb-4">
                  Lawyer Information
                </h3>

                <div className="row g-3">

                  {/* Specialization */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        ⚖️ Specialization
                      </strong>

                      <p>
                        {
                          lawyer.specialization
                        }
                      </p>

                    </div>

                  </div>

                  {/* Location */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📍 Location
                      </strong>

                      <p>
                        {
                          lawyer.location
                        }
                      </p>

                    </div>

                  </div>

                  {/* Experience */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        💼 Experience
                      </strong>

                      <p>
                        {
                          lawyer.experience
                        }{" "}
                        Years
                      </p>

                    </div>

                  </div>

                  {/* Fee */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        💰 Consultation Fee
                      </strong>

                      <p>
                        ₹
                        {
                          lawyer.consultationFee
                        }
                      </p>

                    </div>

                  </div>

                  {/* Next Available */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📅 Next Available
                      </strong>

                      <p>
                        {
                          lawyer.nextAvailable
                        }
                      </p>

                    </div>

                  </div>

                  {/* Availability */}
                  <div className="col-md-6">

                    <div className="profile-info-box">

                      <strong>
                        📌 Availability
                      </strong>

                      <p>

                        {lawyerIsAvailable
                          ? "Available"
                          : "Currently Unavailable"}

                      </p>

                    </div>

                  </div>

                </div>

                <hr className="my-4" />

                {/* ==============================
                    AVAILABLE SLOTS
                ============================== */}

                <h3 className="fw-bold">
                  📅 Available Consultation Slots
                </h3>

                {availableDays.length >
                0 ? (

                  <div className="mt-3">

                    {availableDays.map(
                      ([day, slots]) => (

                        <div
                          key={day}
                          className="mb-4"
                        >

                          <h5 className="fw-bold text-primary">
                            {day}
                          </h5>

                          <div className="d-flex flex-wrap gap-2 mt-2">

                            {slots.map(
                              (
                                slot,
                                index
                              ) => (

                                <Link
                                  key={`${day}-${slot}-${index}`}
                                  to={`/booking/${lawyer.id}?day=${encodeURIComponent(
                                    day
                                  )}&time=${encodeURIComponent(
                                    slot
                                  )}`}
                                  className="btn btn-outline-primary"
                                >
                                  🕐{" "}
                                  {slot}
                                </Link>

                              )
                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="alert alert-info mt-3">

                    No consultation slots
                    available.

                  </div>

                )}

                <hr className="my-4" />

                {/* ==============================
                    ABOUT LAWYER
                ============================== */}

                <h3 className="fw-bold">
                  About the Lawyer
                </h3>

                <p className="text-muted mt-3">

                  {lawyer.name} is an
                  experienced legal
                  professional specializing
                  in{" "}
                  {
                    lawyer.specialization
                  }.
                  The lawyer provides
                  legal consultation and
                  assistance to clients
                  based on their individual
                  legal requirements.

                </p>

                <h4 className="fw-bold mt-4">
                  Consultation
                </h4>

                <p className="text-muted">

                  Clients can review the
                  lawyer's expertise,
                  availability and
                  consultation fee before
                  booking an appointment.

                </p>

                {/* Buttons */}
                <div className="mt-4">

                  <Link
                    to={`/booking/${lawyer.id}`}
                    className="btn btn-primary me-2"
                  >
                    📅 Book Appointment
                  </Link>

                  <Link
                    to="/"
                    className="btn btn-outline-secondary"
                  >
                    ← Find Other Lawyers
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LawyerProfile;