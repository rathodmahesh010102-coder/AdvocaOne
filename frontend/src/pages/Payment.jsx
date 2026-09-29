import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm p-5 text-center">
          <h2>💳 Payment</h2>

          <p className="text-muted mt-3">
            No appointment selected for payment.
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

  // Support both old and new booking fee fields
  const consultationFee =
    Number(booking.consultationFee ?? booking.fee) || 0;

  const practiceArea =
    booking.specialization ||
    booking.practiceArea ||
    "Legal Consultation";

  const consultationType =
    booking.consultationType ||
    booking.type ||
    "Online";

  const handlePayment = () => {
    alert(
      `Payment of ₹${consultationFee} completed successfully!`
    );

    navigate("/my-bookings");
  };

  return (
    <div className="container py-5">

      {/* PAGE HEADER */}
      <div className="mb-4">
        <h1 className="fw-bold">💳 Payment</h1>

        <p className="text-muted">
          Complete your consultation payment.
        </p>
      </div>


      <div className="row g-4">

        {/* ========================================
            APPOINTMENT DETAILS
        ======================================== */}

        <div className="col-md-7">

          <div className="card shadow-sm p-4">

            <h4 className="fw-bold mb-4">
              📅 Appointment Details
            </h4>


            {/* LAWYER */}

            <div className="mb-3">

              <strong>Lawyer</strong>

              <p className="text-muted mb-0">
                {booking.lawyerName || "Lawyer"}
              </p>

            </div>


            {/* PRACTICE AREA */}

            <div className="mb-3">

              <strong>Practice Area</strong>

              <p className="text-muted mb-0">
                {practiceArea}
              </p>

            </div>


            {/* DATE */}

            <div className="mb-3">

              <strong>Date</strong>

              <p className="text-muted mb-0">
                {booking.date || "Not available"}
              </p>

            </div>


            {/* DAY */}

            {booking.day && (
              <div className="mb-3">

                <strong>Day</strong>

                <p className="text-muted mb-0">
                  {booking.day}
                </p>

              </div>
            )}


            {/* TIME */}

            <div className="mb-3">

              <strong>Time</strong>

              <p className="text-muted mb-0">
                {booking.time || "Not available"}
              </p>

            </div>


            {/* CONSULTATION TYPE */}

            <div className="mb-3">

              <strong>Consultation Type</strong>

              <p className="text-muted mb-0">
                {consultationType}
              </p>

            </div>


            {/* STATUS */}

            <div className="mb-0">

              <strong>Status</strong>

              <p className="mb-0">

                <span className="badge bg-success">
                  {booking.status || "Confirmed"}
                </span>

              </p>

            </div>

          </div>

        </div>



        {/* ========================================
            PAYMENT SUMMARY
        ======================================== */}

        <div className="col-md-5">

          <div className="card shadow-sm p-4">

            <h4 className="fw-bold mb-4">
              💰 Payment Summary
            </h4>


            {/* CONSULTATION FEE */}

            <div className="d-flex justify-content-between mb-3">

              <span>
                Consultation Fee
              </span>

              <strong>
                ₹{consultationFee}
              </strong>

            </div>


            <hr />


            {/* TOTAL */}

            <div className="d-flex justify-content-between mb-4">

              <strong>
                Total
              </strong>

              <strong className="text-primary fs-4">
                ₹{consultationFee}
              </strong>

            </div>


            {/* PAY BUTTON */}

            <button
              className="btn btn-primary w-100"
              onClick={handlePayment}
            >
              💳 Pay ₹{consultationFee}
            </button>


            {/* CANCEL */}

            <button
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => navigate("/my-bookings")}
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Payment;