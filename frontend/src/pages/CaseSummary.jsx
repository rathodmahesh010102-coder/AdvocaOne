import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const STORAGE_KEY = "advocaOneCaseSummaries";

const getLoggedInUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("advocaOneLoggedInUser") || "null"
    );
  } catch {
    return null;
  }
};

const getSavedSummaries = (email) => {
  try {
    const allSummaries = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(allSummaries)) {
      return [];
    }

    return allSummaries.filter(
      (summary) =>
        String(summary?.clientEmail || "").toLowerCase() ===
        String(email || "").toLowerCase()
    );
  } catch {
    return [];
  }
};

const generateCaseSummary = (description) => {
  const text = description.trim();

  const lowerText = text.toLowerCase();

  let caseTitle = "General Legal Matter";
  let legalIssue = "Legal issue requiring professional review.";

  if (
    lowerText.includes("property") ||
    lowerText.includes("land") ||
    lowerText.includes("house")
  ) {
    caseTitle = "Property Dispute";
    legalIssue =
      "The matter appears to involve a property, land, ownership, possession, or related dispute.";
  } else if (
    lowerText.includes("divorce") ||
    lowerText.includes("marriage") ||
    lowerText.includes("husband") ||
    lowerText.includes("wife")
  ) {
    caseTitle = "Family / Marriage Matter";
    legalIssue =
      "The matter appears to involve a family or marriage-related legal issue.";
  } else if (
    lowerText.includes("fraud") ||
    lowerText.includes("scam") ||
    lowerText.includes("cyber") ||
    lowerText.includes("online")
  ) {
    caseTitle = "Cyber / Online Fraud Matter";
    legalIssue =
      "The matter appears to involve an online transaction, cyber incident, fraud, or related issue.";
  } else if (
    lowerText.includes("job") ||
    lowerText.includes("salary") ||
    lowerText.includes("employee") ||
    lowerText.includes("employer")
  ) {
    caseTitle = "Employment Matter";
    legalIssue =
      "The matter appears to involve an employment, salary, workplace, or employer-related issue.";
  } else if (
    lowerText.includes("police") ||
    lowerText.includes("fir") ||
    lowerText.includes("criminal")
  ) {
    caseTitle = "Criminal Law Matter";
    legalIssue =
      "The matter appears to involve a criminal-law or police-related issue.";
  } else if (
    lowerText.includes("consumer") ||
    lowerText.includes("refund") ||
    lowerText.includes("product")
  ) {
    caseTitle = "Consumer Dispute";
    legalIssue =
      "The matter appears to involve a consumer, product, service, or refund-related issue.";
  }

  const sentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const importantFacts =
    sentences.length > 0
      ? sentences.slice(0, 4)
      : [
          "The client has provided a legal matter for review.",
        ];

  const suggestedDocuments = [
    "Identity proof",
    "Relevant agreements or contracts",
    "Payment or transaction records",
    "Emails, messages, notices, or correspondence",
    "Other documents related to the matter",
  ];

  const nextSteps = [
    "Keep all relevant documents and evidence safely.",
    "Prepare a clear timeline of important events.",
    "Avoid signing or accepting important documents without understanding them.",
    "Consult a qualified lawyer for advice specific to the facts of the case.",
  ];

  return {
    caseTitle,
    legalIssue,
    importantFacts,
    suggestedDocuments,
    nextSteps,
  };
};

function CaseSummary() {
  const user = getLoggedInUser();

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSavedSummaries(
      getSavedSummaries(userEmail)
    );
  }, [userEmail]);

  const generateSummary = () => {
    const trimmedDescription =
      description.trim();

    if (!trimmedDescription) {
      setMessage(
        "Please enter your case description first."
      );
      return;
    }

    setMessage("");
    setIsGenerating(true);

    setTimeout(() => {
      const generatedSummary =
        generateCaseSummary(
          trimmedDescription
        );

      const completeSummary = {
        id: `case_summary_${Date.now()}`,
        clientEmail: userEmail,
        clientName: userName,
        originalDescription:
          trimmedDescription,
        ...generatedSummary,
        createdAt:
          new Date().toISOString(),
      };

      setSummary(completeSummary);
      setIsGenerating(false);
    }, 900);
  };

  const saveSummary = () => {
    if (!summary || !userEmail) {
      return;
    }

    try {
      const allSummaries = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const existingSummaries =
        Array.isArray(allSummaries)
          ? allSummaries
          : [];

      const alreadySaved =
        existingSummaries.some(
          (item) =>
            item?.id === summary?.id
        );

      if (!alreadySaved) {
        const updatedSummaries = [
          summary,
          ...existingSummaries,
        ];

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            updatedSummaries
          )
        );

        setSavedSummaries(
          getSavedSummaries(userEmail)
        );

        setMessage(
          "Case summary saved successfully."
        );
      } else {
        setMessage(
          "This case summary is already saved."
        );
      }
    } catch {
      setMessage(
        "Unable to save the case summary."
      );
    }
  };

  const deleteSummary = (summaryId) => {
    try {
      const allSummaries = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const updatedSummaries =
        Array.isArray(allSummaries)
          ? allSummaries.filter(
              (item) =>
                item?.id !== summaryId
            )
          : [];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedSummaries
        )
      );

      setSavedSummaries(
        getSavedSummaries(userEmail)
      );

      if (summary?.id === summaryId) {
        setSummary(null);
      }

      setMessage(
        "Case summary deleted."
      );
    } catch {
      setMessage(
        "Unable to delete the case summary."
      );
    }
  };

  const viewSavedSummary = (
    savedSummary
  ) => {
    setSummary(savedSummary);

    setDescription(
      savedSummary.originalDescription ||
        ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const startNewSummary = () => {
    setDescription("");
    setSummary(null);
    setMessage("");
  };

  return (
    <div className="case-summary-page">

      {/* HEADER */}

      <header className="app-header">

        <div className="header-container">

          <Link
            to="/dashboard"
            className="logo"
          >
            ⚖️ AdvocaOne
          </Link>

          <nav className="header-nav">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/legal-assistant">
              AI Legal Assistant
            </Link>

            <Link to="/my-bookings">
              My Consultations
            </Link>

            <Link to="/profile">
              My Profile
            </Link>

          </nav>

        </div>

      </header>

      {/* MAIN */}

      <main className="case-summary-container">

        {/* PAGE HEADER */}

        <section className="case-summary-heading">

          <div>

            <p className="dashboard-eyebrow">
              AI LEGAL TOOL
            </p>

            <h1>
              📝 AI Case Summary
            </h1>

            <p>
              Describe your legal matter in
              simple words and generate a
              structured case summary.
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={startNewSummary}
          >
            + New Summary
          </button>

        </section>

        {/* DISCLAIMER */}

        <div className="assistant-disclaimer">

          <strong>
            ⚠️ Important:
          </strong>

          <span>
            This tool creates a general
            informational summary. It does
            not provide legal advice or
            replace consultation with a
            qualified lawyer.
          </span>

        </div>

        {/* INPUT */}

        <section className="case-summary-input-card">

          <div className="card-title">

            <div>
              <span className="card-icon">
                📋
              </span>

              <div>
                <h2>
                  Describe Your Case
                </h2>

                <p>
                  Include important facts,
                  dates, people involved and
                  the problem you are facing.
                </p>
              </div>
            </div>

          </div>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Example: I purchased a property in Pune. I have the sale agreement and payment receipts, but another person is claiming ownership of the property..."
            rows="9"
          />

          <div className="case-input-footer">

            <span>
              {description.length} characters
            </span>

            <button
              className="primary-button"
              onClick={generateSummary}
              disabled={
                !description.trim() ||
                isGenerating
              }
            >
              {isGenerating
                ? "Generating..."
                : "🤖 Generate Summary"}
            </button>

          </div>

          {message && (
            <div className="case-summary-message">
              {message}
            </div>
          )}

        </section>

        {/* GENERATED SUMMARY */}

        {summary && (
          <section className="generated-summary-card">

            <div className="generated-summary-header">

              <div>

                <p className="dashboard-eyebrow">
                  GENERATED SUMMARY
                </p>

                <h2>
                  {summary.caseTitle}
                </h2>

              </div>

              <button
                className="primary-button"
                onClick={saveSummary}
              >
                💾 Save Summary
              </button>

            </div>

            {/* LEGAL ISSUE */}

            <div className="summary-section">

              <h3>
                ⚖️ Legal Issue
              </h3>

              <p>
                {summary.legalIssue}
              </p>

            </div>

            {/* IMPORTANT FACTS */}

            <div className="summary-section">

              <h3>
                📌 Important Facts
              </h3>

              <ul>
                {summary.importantFacts.map(
                  (fact, index) => (
                    <li key={index}>
                      {fact}
                    </li>
                  )
                )}
              </ul>

            </div>

            {/* DOCUMENTS */}

            <div className="summary-section">

              <h3>
                📄 Suggested Documents
              </h3>

              <ul>
                {summary.suggestedDocuments.map(
                  (document, index) => (
                    <li key={index}>
                      {document}
                    </li>
                  )
                )}
              </ul>

            </div>

            {/* NEXT STEPS */}

            <div className="summary-section">

              <h3>
                🚀 Suggested Next Steps
              </h3>

              <ol>
                {summary.nextSteps.map(
                  (step, index) => (
                    <li key={index}>
                      {step}
                    </li>
                  )
                )}
              </ol>

            </div>

            {/* ORIGINAL DESCRIPTION */}

            <details className="original-case-details">

              <summary>
                View Original Case Description
              </summary>

              <p>
                {summary.originalDescription}
              </p>

            </details>

          </section>
        )}

        {/* SAVED SUMMARIES */}

        <section className="saved-summaries-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-eyebrow">
                SAVED CASES
              </p>

              <h2>
                My Case Summaries
              </h2>

            </div>

          </div>

          {savedSummaries.length === 0 ? (
            <div className="dashboard-empty-state">

              <div className="dashboard-empty-icon">
                📝
              </div>

              <h3>
                No saved summaries
              </h3>

              <p>
                Generate and save your first
                case summary.
              </p>

            </div>
          ) : (
            <div className="saved-summary-list">

              {savedSummaries.map(
                (savedSummary) => (
                  <div
                    className="saved-summary-card"
                    key={savedSummary.id}
                  >

                    <div className="saved-summary-icon">
                      ⚖️
                    </div>

                    <div className="saved-summary-content">

                      <h3>
                        {savedSummary.caseTitle}
                      </h3>

                      <p>
                        {savedSummary.legalIssue}
                      </p>

                      <small>
                        {new Date(
                          savedSummary.createdAt
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </small>

                    </div>

                    <div className="saved-summary-actions">

                      <button
                        className="view-summary-button"
                        onClick={() =>
                          viewSavedSummary(
                            savedSummary
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="delete-summary-button"
                        onClick={() =>
                          deleteSummary(
                            savedSummary.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default CaseSummary;