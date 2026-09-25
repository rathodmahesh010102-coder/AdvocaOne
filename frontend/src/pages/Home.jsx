import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import lawyers from "../data/lawyers";

function Home() {
  const [menuOpen,setMenuOpen] =useState("");
  const [searchPractice, setSearchPractice] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchExperience, setSearchExperience] = useState("");
  const [searchFee, setSearchFee] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [registeredLawyers, setRegisteredLawyers] = useState([]);

  const loadRegisteredLawyers = () => {
    try {
      const savedLawyers = localStorage.getItem(
        "advocaOneAdminLawyers"
      );

      const parsedLawyers = savedLawyers
        ? JSON.parse(savedLawyers)
        : [];

      setRegisteredLawyers(
        Array.isArray(parsedLawyers) ? parsedLawyers : []
      );
    } catch (error) {
      console.error("Error loading lawyers:", error);
      setRegisteredLawyers([]);
    }
  };

  useEffect(() => {
    loadRegisteredLawyers();

    window.addEventListener("storage", loadRegisteredLawyers);
    window.addEventListener("focus", loadRegisteredLawyers);

    return () => {
      window.removeEventListener("storage", loadRegisteredLawyers);
      window.removeEventListener("focus", loadRegisteredLawyers);
    };
  }, []);

  const approvedRegisteredLawyers = registeredLawyers
    .filter(
      (lawyer) =>
        String(lawyer.status || "").toLowerCase() === "approved"
    )
    .map((lawyer) => ({
      ...lawyer,
      location:
        lawyer.city &&
        lawyer.city !== "Not Selected"
          ? lawyer.city
          : "",
      consultationFee: Number(lawyer.fee) || 0,
      experience: Number(lawyer.experience) || 0,
      available: true,
      onlineStatus: lawyer.onlineStatus || "Offline",
      appointmentStatus:
        lawyer.appointmentStatus || "Accepting Appointments",
      nextAvailable:
        lawyer.nextAvailable || "Contact for availability",
      slots: Array.isArray(lawyer.slots)
        ? lawyer.slots
        : [],
    }));

  const allLawyers = Array.from(
    new Map(
      [...lawyers, ...approvedRegisteredLawyers].map(
        (lawyer) => [
          `${lawyer.id}-${lawyer.name}`,
          lawyer,
        ]
      )
    ).values()
  );

  const filteredLawyers = allLawyers.filter((lawyer) => {
    const lawyerSpecialization = String(
      lawyer.specialization || ""
    )
      .trim()
      .toLowerCase();

    const lawyerLocation = String(
      lawyer.location || lawyer.city || ""
    )
      .trim()
      .toLowerCase();

    const lawyerName = String(
      lawyer.name || ""
    )
      .trim()
      .toLowerCase();

    const practice = searchPractice
      .trim()
      .toLowerCase();

    const location = searchLocation
      .trim()
      .toLowerCase();

    const name = searchName
      .trim()
      .toLowerCase();

    const practiceMatch =
      practice === "" ||
      lawyerSpecialization === practice;

    const locationMatch =
      location === "" ||
      lawyerLocation.includes(location);

    const nameMatch =
      name === "" ||
      lawyerName.includes(name);

    const experienceMatch =
      searchExperience === "" ||
      Number(lawyer.experience || 0) >=
        Number(searchExperience);

    const feeMatch =
      searchFee === "" ||
      Number(
        lawyer.consultationFee ??
          lawyer.fee ??
          0
      ) <= Number(searchFee);

    const availabilityMatch =
      !availableOnly ||
      lawyer.available === true;

    return (
      practiceMatch &&
      locationMatch &&
      nameMatch &&
      experienceMatch &&
      feeMatch &&
      availabilityMatch
    );
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const lawyersSection =
        document.getElementById("lawyers");

      if (
        window.location.hash === "#lawyers" &&
        lawyersSection
      ) {
        lawyersSection.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const clearFilters = () => {
    setSearchPractice("");
    setSearchLocation("");
    setSearchName("");
    setSearchExperience("");
    setSearchFee("");
    setAvailableOnly(false);

    document
      .getElementById("lawyers")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const handlePracticeClick = (practice) => {
    setSearchPractice(practice);

    document
      .getElementById("lawyers")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <div className="advocaone">

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
  <div className="container">

    <Link
      className="navbar-brand fw-bold"
      to="/"
      onClick={() => setMenuOpen(false)}
    >
      ⚖️ AdvocaOne
    </Link>

    {/* Mobile Menu Button */}
    <button
      className="navbar-toggler"
      type="button"
      onClick={() => setMenuOpen(!menuOpen)}
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
    >
      <span className="navbar-toggler-icon"></span>
    </button>

    {/* Navigation Menu */}
    <div
      className={`collapse navbar-collapse ${
        menuOpen ? "show" : ""
      }`}
      id="navbarNav"
    >
      <ul className="navbar-nav ms-auto align-items-lg-center">

        <li className="nav-item">
          <a
            className="nav-link"
            href="#home"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>
        </li>

        <li className="nav-item">
          <a
            className="nav-link"
            href="#lawyers"
            onClick={() => setMenuOpen(false)}
          >
            Find Lawyers
          </a>
        </li>

        <li className="nav-item">
          <a
            className="nav-link"
            href="#practice"
            onClick={() => setMenuOpen(false)}
          >
            Practice Areas
          </a>
        </li>

        <li className="nav-item">
          <a
            className="nav-link"
            href="#how-it-works"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </a>
        </li>

        <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
          <div className="d-flex gap-2">

            <Link
              className="btn btn-outline-light px-4"
              to="/register"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>

            <Link
              className="btn btn-primary px-4"
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

          </div>
        </li>

      </ul>
    </div>

  </div>
</nav>

      <section
        id="home"
        className="hero-section"
      >
        <div className="container">

          <div className="row align-items-center min-vh-100">

            <div className="col-lg-6">

              <span className="badge bg-primary-subtle text-primary mb-3">
                Trusted Legal Consultation Platform
              </span>

              <h1 className="display-4 fw-bold">
                Find the Right Lawyer{" "}
                <span className="text-primary">
                  for Your Case
                </span>
              </h1>

              <p className="lead text-muted mt-4">
                Connect with verified lawyers,
                explore their expertise, check
                availability, and book a legal
                consultation online.
              </p>

              <div className="hero-buttons mt-4">

                <a
                  href="#lawyers"
                  className="btn btn-primary btn-lg me-3"
                >
                  Find a Lawyer
                </a>

                <a
                  href="#how-it-works"
                  className="btn btn-outline-dark btn-lg"
                >
                  How It Works
                </a>

              </div>

            </div>

            <div className="col-lg-6 text-center">

              <div className="hero-card">

                <div className="balance-icon">
                  ⚖️
                </div>

                <h3>
                  Legal Help Made Simple
                </h3>

                <p className="text-muted">
                  Search. Connect. Consult.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      <section
        id="lawyers"
        className="search-section py-5"
      >
        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Find a Lawyer
            </h2>

            <p className="text-muted">
              Search lawyers based on
              expertise, location and
              availability.
            </p>

          </div>

          <div className="search-box lawyer-search-box shadow p-4 rounded">

            <div className="row g-3">

              <div className="col-md-4">

                <label className="form-label">
                  Practice Area
                </label>

                <select
                  className="form-select"
                  value={searchPractice}
                  onChange={(e) =>
                    setSearchPractice(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Practice Area
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
                  Location
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter city"
                  value={searchLocation}
                  onChange={(e) =>
                    setSearchLocation(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="col-md-4">

                <label className="form-label">
                  Lawyer Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search lawyer"
                  value={searchName}
                  onChange={(e) =>
                    setSearchName(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="col-md-4">

                <label className="form-label">
                  Minimum Experience
                </label>

                <select
                  className="form-select"
                  value={searchExperience}
                  onChange={(e) =>
                    setSearchExperience(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Any Experience
                  </option>

                  <option value="2">
                    2+ Years
                  </option>

                  <option value="5">
                    5+ Years
                  </option>

                  <option value="10">
                    10+ Years
                  </option>

                  <option value="15">
                    15+ Years
                  </option>

                </select>

              </div>

              <div className="col-md-4">

                <label className="form-label">
                  Maximum Consultation Fee
                </label>

                <select
                  className="form-select"
                  value={searchFee}
                  onChange={(e) =>
                    setSearchFee(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Any Fee
                  </option>

                  <option value="500">
                    ₹500 or less
                  </option>

                  <option value="1000">
                    ₹1000 or less
                  </option>

                  <option value="2000">
                    ₹2000 or less
                  </option>

                  <option value="5000">
                    ₹5000 or less
                  </option>

                </select>

              </div>

              <div className="col-md-4 d-flex align-items-end">

                <div className="form-check mb-2">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="availableOnly"
                    checked={availableOnly}
                    onChange={(e) =>
                      setAvailableOnly(
                        e.target.checked
                      )
                    }
                  />

                  <label
                    className="form-check-label"
                    htmlFor="availableOnly"
                  >
                    Show Available Lawyers Only
                  </label>

                </div>

              </div>

            </div>

            <div className="text-center mt-4">

              <button
                type="button"
                className="btn btn-primary px-5 me-2"
                onClick={() =>
                  document
                    .getElementById("lawyers")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                🔍 Search Lawyers
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary px-5"
                onClick={clearFilters}
              >
                Clear
              </button>

            </div>

          </div>

          <div className="mt-5">

            <h2 className="text-center mb-2">
              Available Lawyers
            </h2>

            {searchPractice && (
              <p className="text-center text-muted mb-4">
                Showing lawyers for:{" "}
                <strong>
                  {searchPractice}
                </strong>
              </p>
            )}

            <div className="row">

              {filteredLawyers.length > 0 ? (

                filteredLawyers.map((lawyer) => {

                  const onlineStatusClass =
                    lawyer.onlineStatus === "Online"
                      ? "badge bg-success"
                      : lawyer.onlineStatus === "Away"
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

                  return (
                    <div
                      className="col-md-6 col-lg-3 mb-4"
                      key={`${lawyer.id}-${lawyer.name}`}
                    >

                      <div className="card lawyer-card h-100 shadow-sm">

                        <div className="card-body">

                          <div className="lawyer-avatar">
                            ⚖️
                          </div>

                          <h5 className="card-title lawyer-name">
                            {lawyer.name}
                          </h5>

                          <hr />

                          <p className="card-text">
                            <strong>
                              Specialization:
                            </strong>{" "}
                            {lawyer.specialization}
                          </p>

                          <p className="card-text">
                            <strong>
                              Location:
                            </strong>{" "}
                            {lawyer.location ||
                              "Not specified"}
                          </p>

                          <p className="card-text">
                            <strong>
                              Experience:
                            </strong>{" "}
                            {lawyer.experience} years
                          </p>

                          <p className="card-text consultation-fee">
                            <strong>
                              Consultation:
                            </strong>{" "}
                            ₹
                            {Number(
                              lawyer.consultationFee ||
                                lawyer.fee ||
                                0
                            )}
                          </p>

                          <div className="d-flex flex-wrap gap-2 mb-3">

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
                              {lawyer.onlineStatus}
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
                              {lawyer.appointmentStatus}
                            </span>

                          </div>

                          <p className="card-text">
                            <strong>
                              Next Available:
                            </strong>{" "}
                            {lawyer.nextAvailable}
                          </p>

                          <Link
                            to={`/lawyer/${lawyer.id}`}
                            className="btn btn-primary w-100 mt-3 profile-button"
                          >
                            View Profile
                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                })

              ) : (

                <div className="col-12 text-center">

                  <p className="text-muted fs-5">
                    No lawyers found matching
                    your search.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>
      </section>

      <section
        id="practice"
        className="py-5"
      >

        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Practice Areas
            </h2>

            <p className="text-muted">
              Find lawyers specialized in
              different areas of law.
            </p>

          </div>

          <div className="row g-4">

            <PracticeArea
              icon="⚖️"
              title="Criminal Law"
              onClick={() =>
                handlePracticeClick("Criminal Law")
              }
            />

            <PracticeArea
              icon="👨‍👩‍👧"
              title="Family Law"
              onClick={() =>
                handlePracticeClick("Family Law")
              }
            />

            <PracticeArea
              icon="🏢"
              title="Corporate Law"
              onClick={() =>
                handlePracticeClick("Corporate Law")
              }
            />

            <PracticeArea
              icon="🏠"
              title="Property Law"
              onClick={() =>
                handlePracticeClick("Property Law")
              }
            />

            <PracticeArea
              icon="💻"
              title="Cyber Law"
              onClick={() =>
                handlePracticeClick("Cyber Law")
              }
            />

            <PracticeArea
              icon="📄"
              title="Consumer Law"
              onClick={() =>
                handlePracticeClick("Consumer Law")
              }
            />

            <PracticeArea
              icon="💰"
              title="Tax Law"
              onClick={() =>
                handlePracticeClick("Tax Law")
              }
            />

            <PracticeArea
              icon="🏛️"
              title="Civil Law"
              onClick={() =>
                handlePracticeClick("Civil Law")
              }
            />

            <PracticeArea
              icon="👷"
              title="Labor Law"
              onClick={() =>
                handlePracticeClick("Labor Law")
              }
            />

            <PracticeArea
              icon="📜"
              title="Constitutional Law"
              onClick={() =>
                handlePracticeClick(
                  "Constitutional Law"
                )
              }
            />

            <PracticeArea
              icon="💡"
              title="Intellectual Property Law"
              onClick={() =>
                handlePracticeClick(
                  "Intellectual Property Law"
                )
              }
            />

            <PracticeArea
              icon="🌱"
              title="Environmental Law"
              onClick={() =>
                handlePracticeClick(
                  "Environmental Law"
                )
              }
            />

          </div>

        </div>

      </section>

      <section
        id="how-it-works"
        className="how-section py-5"
      >

        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold">
              How AdvocaOne Works
            </h2>

            <p className="text-muted">
              Get connected with a lawyer in
              three simple steps.
            </p>

          </div>

          <div className="row g-4 text-center">

            <Step
              number="1"
              title="Search"
              text="Find lawyers based on practice area and location."
            />

            <Step
              number="2"
              title="Choose"
              text="View lawyer profiles, experience and availability."
            />

            <Step
              number="3"
              title="Book"
              text="Select an available slot and book your consultation."
            />

          </div>

        </div>

      </section>

      <section className="cta-section py-5">

        <div className="container text-center">

          <h2 className="fw-bold">
            Need Legal Assistance?
          </h2>

          <p className="mt-3">
            Find a verified lawyer and
            schedule your consultation
            today.
          </p>

          <a
            href="#lawyers"
            className="btn btn-light btn-lg mt-3"
          >
            Find a Lawyer
          </a>

        </div>

      </section>

      <footer className="bg-dark text-white py-4">

        <div className="container">

          <div className="row">

            <div className="col-md-6">

              <h5>
                ⚖️ AdvocaOne
              </h5>

              <p className="text-secondary">
                A multi-lawyer legal
                consultation and appointment
                platform.
              </p>

            </div>

            <div className="col-md-6 text-md-end">

              <p className="mb-1">
                Find Lawyers · Book
                Consultation · Legal Assistance
              </p>

              <small className="text-secondary">
                © 2026 AdvocaOne. All Rights Reserved.
              </small>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

function PracticeArea({
  icon,
  title,
  onClick,
}) {
  return (
    <div className="col-md-4">

      <div
        className="practice-card text-center p-4 h-100"
        onClick={onClick}
      >

        <div className="practice-icon">
          {icon}
        </div>

        <h5 className="fw-bold mt-3">
          {title}
        </h5>

        <p className="text-muted">
          Connect with experienced lawyers
          specializing in {title}.
        </p>

      </div>

    </div>
  );
}

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="col-md-4">

      <div className="step-card">

        <div className="step-number">
          {number}
        </div>

        <h5 className="fw-bold mt-3">
          {title}
        </h5>

        <p className="text-muted">
          {text}
        </p>

      </div>

    </div>
  );
}

export default Home;

