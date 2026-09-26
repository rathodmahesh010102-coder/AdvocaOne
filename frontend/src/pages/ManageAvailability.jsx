import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ManageAvailability() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  /* =====================================================
     DEFAULT AVAILABILITY
  ===================================================== */

  const defaultDays = {
    Monday: ["10:00 AM", "2:00 PM", "5:00 PM"],
    Tuesday: ["10:00 AM", "1:00 PM", "4:00 PM"],
    Wednesday: ["11:00 AM", "3:00 PM"],
    Thursday: ["10:00 AM", "2:00 PM", "6:00 PM"],
    Friday: ["10:00 AM", "1:00 PM", "4:00 PM"],
    Saturday: ["10:00 AM", "12:00 PM"],
    Sunday: [],
  };

  /* =====================================================
     GET LOGGED-IN LAWYER
  ===================================================== */

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("advocaOneLoggedInUser") || "null"
      );
    } catch {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const loggedInEmail =
    loggedInUser?.email?.trim().toLowerCase() || "";

  /* =====================================================
     LOAD LAWYER-SPECIFIC AVAILABILITY
  ===================================================== */

  const getSavedAvailability = () => {
    if (!loggedInEmail) {
      return defaultDays;
    }

    try {
      const allAvailabilities = JSON.parse(
        localStorage.getItem("advocaOneAvailabilities") || "{}"
      );

      return allAvailabilities[loggedInEmail] || defaultDays;
    } catch {
      return defaultDays;
    }
  };

  const [days, setDays] = useState(
    getSavedAvailability
  );

  const [newSlot, setNewSlot] = useState("");
  const [saved, setSaved] = useState(false);

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  /* =====================================================
     CONVERT TIME TO MINUTES
  ===================================================== */

  const convertToMinutes = (time) => {
    const match = time.match(
      /(\d+):(\d+)\s(AM|PM)/
    );

    if (!match) {
      return 0;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3];

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  };

  /* =====================================================
     ADD SLOT
  ===================================================== */

  const addSlot = () => {
    if (!newSlot) {
      alert("Please select a time.");
      return;
    }

    if (!loggedInEmail) {
      alert(
        "Logged-in lawyer account not found. Please login again."
      );
      return;
    }

    const formattedSlot = formatTime(newSlot);

    if (days[selectedDay].includes(formattedSlot)) {
      alert("This time slot already exists.");
      return;
    }

    const updatedSlots = [
      ...days[selectedDay],
      formattedSlot,
    ].sort(
      (a, b) =>
        convertToMinutes(a) -
        convertToMinutes(b)
    );

    const updatedDays = {
      ...days,
      [selectedDay]: updatedSlots,
    };

    setDays(updatedDays);
    setNewSlot("");
    setSaved(false);
  };

  /* =====================================================
     REMOVE SLOT
  ===================================================== */

  const removeSlot = (slot) => {
    const updatedDays = {
      ...days,
      [selectedDay]: days[
        selectedDay
      ].filter(
        (time) => time !== slot
      ),
    };

    setDays(updatedDays);
    setSaved(false);
  };

  /* =====================================================
     SAVE LAWYER-SPECIFIC AVAILABILITY
  ===================================================== */

  const saveAvailability = () => {
    if (!loggedInEmail) {
      alert(
        "Logged-in lawyer account not found. Please login again."
      );
      return;
    }

    let allAvailabilities = {};

    try {
      allAvailabilities =
        JSON.parse(
          localStorage.getItem(
            "advocaOneAvailabilities"
          ) || "{}"
        ) || {};
    } catch {
      allAvailabilities = {};
    }

    /* Save only for current lawyer */

    allAvailabilities[
      loggedInEmail
    ] = days;

    localStorage.setItem(
      "advocaOneAvailabilities",
      JSON.stringify(
        allAvailabilities
      )
    );

    /* Keep old storage temporarily for compatibility */

    localStorage.setItem(
      "advocaOneAvailability",
      JSON.stringify(days)
    );

    window.dispatchEvent(
      new Event("storage")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

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
            Manage Availability
          </h1>

          <p className="text-muted">
            Set the days and time slots when clients
            can book consultations.
          </p>

          {loggedInUser?.name && (
            <div className="alert alert-info">
              👨‍⚖️ Managing availability for{" "}
              <strong>
                {loggedInUser.name}
              </strong>
            </div>
          )}

        </div>

        <div className="row g-4">

          {/* =================================================
              WORKING DAYS
          ================================================= */}

          <div className="col-md-4">

            <div className="card shadow-sm p-3">

              <h5 className="fw-bold mb-3">
                📅 Working Days
              </h5>

              {dayNames.map((day) => (

                <button
                  key={day}
                  className={
                    selectedDay === day
                      ? "btn btn-primary mb-2 text-start"
                      : "btn btn-outline-secondary mb-2 text-start"
                  }
                  onClick={() =>
                    setSelectedDay(day)
                  }
                >
                  {day}

                  <span className="float-end">
                    {days[day].length} slots
                  </span>

                </button>

              ))}

            </div>

          </div>

          {/* =================================================
              AVAILABILITY SLOTS
          ================================================= */}

          <div className="col-md-8">

            <div className="card shadow-sm p-4">

              <h3 className="fw-bold">
                {selectedDay}
              </h3>

              <p className="text-muted">
                Available consultation slots
              </p>

              <hr />

              <div className="row g-3 mb-4">

                {days[selectedDay].length === 0 ? (

                  <div className="col-12">

                    <div className="alert alert-light border">
                      No availability added for{" "}
                      {selectedDay}.
                    </div>

                  </div>

                ) : (

                  days[
                    selectedDay
                  ].map((slot) => (

                    <div
                      className="col-sm-6 col-lg-4"
                      key={slot}
                    >

                      <div className="border rounded p-3 d-flex justify-content-between align-items-center">

                        <span className="fw-semibold">
                          🕐 {slot}
                        </span>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            removeSlot(slot)
                          }
                        >
                          ✕
                        </button>

                      </div>

                    </div>

                  ))

                )}

              </div>

              <hr />

              {/* =================================================
                  ADD SLOT
              ================================================= */}

              <h5 className="fw-bold">
                ➕ Add New Time Slot
              </h5>

              <div className="row g-2 mt-2">

                <div className="col-md-8">

                  <input
                    type="time"
                    className="form-control"
                    value={newSlot}
                    onChange={(e) =>
                      setNewSlot(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="col-md-4">

                  <button
                    className="btn btn-primary w-100"
                    onClick={addSlot}
                  >
                    + Add Slot
                  </button>

                </div>

              </div>

              {/* =================================================
                  SAVE
              ================================================= */}

              <button
                className="btn btn-success btn-lg w-100 mt-4"
                onClick={
                  saveAvailability
                }
              >
                💾 Save Availability
              </button>

              {saved && (

                <div className="alert alert-success mt-3 mb-0">
                  ✅ Availability saved successfully.
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ManageAvailability;