import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

function VideoConsultation() {
  const location = useLocation();
  const navigate = useNavigate();

  const appointment = location.state?.appointment;

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  if (!appointment) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm p-5 text-center">
          <h2>🎥 Video Consultation</h2>

          <p className="text-muted mt-3">
            No consultation appointment selected.
          </p>

          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/my-bookings")}
          >
            ← My Bookings
          </button>
        </div>
      </div>
    );
  }

  const handleLeave = () => {
    navigate("/my-bookings");
  };

  return (
    <div className="container py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">🎥 Video Consultation</h1>

          <p className="text-muted mb-0">
            Your online legal consultation
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={handleLeave}
        >
          ← Back
        </button>
      </div>

      <div className="row g-4">

        {/* Video Area */}
        <div className="col-lg-8">

          <div
            className="card shadow-sm"
            style={{
              background: "#111",
              minHeight: "500px",
              position: "relative",
              overflow: "hidden",
            }}
          >

            {/* Main Video */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: "500px",
                color: "white",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "80px" }}>
                  {cameraOn ? "🎥" : "🚫"}
                </div>

                <h3 className="mt-3">
                  {cameraOn
                    ? "Camera is ready"
                    : "Camera is off"}
                </h3>

                <p className="text-secondary">
                  Video consultation will connect here.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div
              className="position-absolute bottom-0 start-0 end-0 p-3"
              style={{
                background: "rgba(0,0,0,0.75)",
              }}
            >

              <div className="d-flex justify-content-center gap-3">

                <button
                  className={`btn ${
                    micOn
                      ? "btn-light"
                      : "btn-danger"
                  }`}
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
                </button>

                <button
                  className={`btn ${
                    cameraOn
                      ? "btn-light"
                      : "btn-danger"
                  }`}
                  onClick={() =>
                    setCameraOn(!cameraOn)
                  }
                >
                  {cameraOn
                    ? "📹 Camera On"
                    : "🚫 Camera Off"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleLeave}
                >
                  📞 Leave
                </button>

              </div>
            </div>

          </div>
        </div>

        {/* Appointment Information */}
        <div className="col-lg-4">

          <div className="card shadow-sm p-4">

            <h4 className="fw-bold mb-4">
              📅 Appointment
            </h4>

            <div className="mb-3">
              <strong>Lawyer</strong>

              <p className="text-muted mb-0">
                {appointment.lawyerName || "Lawyer"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Date</strong>

              <p className="text-muted mb-0">
                {appointment.date || "Not available"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Time</strong>

              <p className="text-muted mb-0">
                {appointment.time || "Not available"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Consultation Type</strong>

              <p className="text-muted mb-0">
                {appointment.consultationType ||
                  appointment.type ||
                  "Online"}
              </p>
            </div>

            <div className="mb-3">
              <strong>Status</strong>

              <p className="mb-0">
                <span className="badge bg-success">
                  {appointment.status || "Confirmed"}
                </span>
              </p>
            </div>

            <hr />

            <div className="alert alert-info mb-0">
              🎥 This is currently a frontend
              video-consultation interface.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default VideoConsultation;
