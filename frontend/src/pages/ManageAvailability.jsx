import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ManageAvailability() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const [days, setDays] = useState(() => {
    try {
      const savedDays = localStorage.getItem(
        "advocaOneAvailability"
      );

      return savedDays
        ? JSON.parse(savedDays)
        : {
            Monday: ["10:00 AM", "2:00 PM", "5:00 PM"],
            Tuesday: ["10:00 AM", "1:00 PM", "4:00 PM"],
            Wednesday: ["11:00 AM", "3:00 PM"],
            Thursday: ["10:00 AM", "2:00 PM", "6:00 PM"],
            Friday: ["10:00 AM", "1:00 PM", "4:00 PM"],
            Saturday: ["10:00 AM", "12:00 PM"],
            Sunday: [],
          };
    } catch {
      return {
        Monday: ["10:00 AM", "2:00 PM", "5:00 PM"],
        Tuesday: ["10:00 AM", "1:00 PM", "4:00 PM"],
        Wednesday: ["11:00 AM", "3:00 PM"],
        Thursday: ["10:00 AM", "2:00 PM", "6:00 PM"],
        Friday: ["10:00 AM", "1:00 PM", "4:00 PM"],
        Saturday: ["10:00 AM", "12:00 PM"],
        Sunday: [],
      };
    }
  });

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

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const convertToMinutes = (time) => {
    const match = time.match(/(\d+):(\d+)\s(AM|PM)/);

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

  const addSlot = () => {
    if (!newSlot) {
      alert("Please select a time.");
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
      (a, b) => convertToMinutes(a) - convertToMinutes(b)
    );

    const updatedDays = {
      ...days,
      [selectedDay]: updatedSlots,
    };

    setDays(updatedDays);
    setNewSlot("");
    setSaved(false);
  };

  const removeSlot = (slot) => {
    const updatedDays = {
      ...days,
      [selectedDay]: days[selectedDay].filter(
        (time) => time !== slot
      ),
    };

    setDays(updatedDays);
    setSaved(false);
  };

  const saveAvailability = () => {
    localStorage.setItem(
      "advocaOneAvailability",
      JSON.stringify(days)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="lawyer-dashboard-page">

      {/* Navbar */}
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

      {/* Main Content */}
      <div className="container py-5">

        <div className="mb-4">

          <h1 className="fw-bold">
            Manage Availability
          </h1>

          <p className="text-muted">
            Set the days and time slots when clients can book consultations.
          </p>

        </div>

        <div className="row g-4">

          {/* Working Days */}
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
                  onClick={() => setSelectedDay(day)}
                >
                  {day}

                  <span className="float-end">
                    {days[day].length} slots
                  </span>

                </button>

              ))}

            </div>

          </div>

          {/* Availability Slots */}
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

                  days[selectedDay].map((slot) => (

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
                          onClick={() => removeSlot(slot)}
                        >
                          ✕
                        </button>

                      </div>

                    </div>

                  ))

                )}

              </div>

              <hr />

              {/* Add Slot */}
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
                      setNewSlot(e.target.value)
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

              {/* Save */}
              <button
                className="btn btn-success btn-lg w-100 mt-4"
                onClick={saveAvailability}
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