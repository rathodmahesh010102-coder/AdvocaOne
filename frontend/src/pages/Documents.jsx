import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  // Load logged-in client and their documents
  useEffect(() => {
    let loggedInUser = null;

    try {
      loggedInUser =
        JSON.parse(
          localStorage.getItem("advocaOneLoggedInUser") || "null"
        ) || null;
    } catch {
      loggedInUser = null;
    }

    const email =
      loggedInUser?.email?.trim().toLowerCase() || "";

    setUserEmail(email);

    try {
      const allDocuments =
        JSON.parse(
          localStorage.getItem("advocaOneDocuments") || "[]"
        ) || [];

      const userDocuments = allDocuments.filter(
        (document) =>
          document.userEmail?.trim().toLowerCase() === email
      );

      setDocuments(userDocuments);
    } catch {
      setDocuments([]);
    }
  }, []);

  // Delete document
  const handleDelete = (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const allDocuments =
        JSON.parse(
          localStorage.getItem("advocaOneDocuments") || "[]"
        ) || [];

      const updatedDocuments = allDocuments.filter(
        (document) => document.id !== documentId
      );

      localStorage.setItem(
        "advocaOneDocuments",
        JSON.stringify(updatedDocuments)
      );

      setDocuments(
        updatedDocuments.filter(
          (document) =>
            document.userEmail?.trim().toLowerCase() ===
            userEmail
        )
      );
    } catch (error) {
      console.error("Unable to delete document:", error);
    }
  };

  return (
    <div className="container py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold">
            📄 My Documents
          </h1>

          <p className="text-muted mb-0">
            Manage documents related to your legal consultations.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          ← Dashboard
        </Link>

      </div>

      {/* Upload Section */}
      <div className="card shadow-sm p-4 mb-4">

        <div className="text-center">

          <div style={{ fontSize: "50px" }}>
            📤
          </div>

          <h4 className="mt-2">
            Upload Document
          </h4>

          <p className="text-muted">
            Document upload functionality will be connected
            to the backend later.
          </p>

          <button
            className="btn btn-primary"
            disabled
          >
            📤 Upload Document
          </button>

        </div>

      </div>

      {/* Documents */}
      <div className="card shadow-sm p-4">

        <h4 className="fw-bold mb-4">
          📁 Your Documents
        </h4>

        {documents.length === 0 ? (

          <div className="text-center py-5">

            <div style={{ fontSize: "50px" }}>
              📄
            </div>

            <h5 className="mt-3">
              No Documents Found
            </h5>

            <p className="text-muted">
              You have not uploaded any documents yet.
            </p>

          </div>

        ) : (

          <div className="row g-3">

            {documents.map((document) => (

              <div
                className="col-md-6"
                key={document.id}
              >

                <div className="border rounded p-3 h-100">

                  <div className="d-flex justify-content-between">

                    <div>

                      <h6 className="fw-bold">
                        📄 {document.name}
                      </h6>

                      <small className="text-muted">
                        {document.type || "Document"}
                      </small>

                    </div>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        handleDelete(document.id)
                      }
                    >
                      🗑️
                    </button>

                  </div>

                  {document.uploadedAt && (
                    <small className="text-muted d-block mt-3">
                      Uploaded:{" "}
                      {new Date(
                        document.uploadedAt
                      ).toLocaleDateString()}
                    </small>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Documents;