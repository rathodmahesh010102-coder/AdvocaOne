import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const STORAGE_KEY = "advocaOneLegalAssistantChats";

const getLoggedInUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("advocaOneLoggedInUser") || "null"
    );
  } catch {
    return null;
  }
};

const getInitialMessages = (userName) => [
  {
    id: "welcome",
    sender: "ai",
    text: `Hello ${userName || "there"}! 👋 I'm the AdvocaOne Legal Assistant.`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "welcome-help",
    sender: "ai",
    text: "I can provide general legal information and help you understand your legal issue. Please describe your situation in simple words.",
    createdAt: new Date().toISOString(),
  },
];

const generateMockResponse = (question) => {
  const text = question.toLowerCase();

  if (
    text.includes("divorce") ||
    text.includes("marriage") ||
    text.includes("husband") ||
    text.includes("wife")
  ) {
    return "For family and marriage-related matters, the applicable legal process can depend on the circumstances and the personal law involved. Important documents and facts should be reviewed before taking action. You may consult a family-law lawyer for advice specific to your situation.";
  }

  if (
    text.includes("property") ||
    text.includes("land") ||
    text.includes("house") ||
    text.includes("rent")
  ) {
    return "Property matters can involve ownership documents, agreements, registration records, notices, and other evidence. Keep copies of all relevant documents and avoid signing anything you do not understand. A property lawyer can review the documents and explain the applicable legal options.";
  }

  if (
    text.includes("cyber") ||
    text.includes("fraud") ||
    text.includes("scam") ||
    text.includes("online")
  ) {
    return "For a suspected cybercrime or online fraud, preserve evidence such as screenshots, transaction details, emails, phone numbers, and messages. Avoid deleting relevant information. Depending on the circumstances, you may need to report the incident to the appropriate cybercrime authorities and consult a lawyer.";
  }

  if (
    text.includes("police") ||
    text.includes("fir") ||
    text.includes("criminal")
  ) {
    return "Criminal-law matters can be time-sensitive. Keep copies of relevant documents, notices, complaints, and other evidence. The correct procedure depends on the facts of the case, so a criminal-law lawyer should review your situation before you take significant legal action.";
  }

  if (
    text.includes("job") ||
    text.includes("salary") ||
    text.includes("employee") ||
    text.includes("employer")
  ) {
    return "Employment-related disputes can involve appointment letters, salary records, company policies, emails, notices, and other employment documents. Keep these records safely. The applicable legal remedies depend on the nature of the employment and dispute.";
  }

  if (
    text.includes("consumer") ||
    text.includes("product") ||
    text.includes("refund")
  ) {
    return "Consumer disputes may involve defective products, deficient services, misleading information, or refund-related issues. Keep invoices, receipts, warranty documents, communications, and payment records. The appropriate remedy depends on the facts and applicable consumer law.";
  }

  return "Thank you for explaining your issue. I can provide general legal information, but the correct legal position depends on the specific facts, documents, location, and applicable law. Please consider consulting a qualified lawyer before making an important legal decision.";
};

function LegalAssistant() {
  const user = getLoggedInUser();

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          `${STORAGE_KEY}_${String(userEmail).toLowerCase()}`
        ) || "null"
      );

      return Array.isArray(saved) && saved.length > 0
        ? saved
        : getInitialMessages(userName);
    } catch {
      return getInitialMessages(userName);
    }
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    localStorage.setItem(
      `${STORAGE_KEY}_${String(userEmail).toLowerCase()}`,
      JSON.stringify(messages)
    );
  }, [messages, userEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const question = input.trim();

    if (!question || isTyping) {
      return;
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: generateMockResponse(question),
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);

      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const initialMessages = getInitialMessages(userName);

    setMessages(initialMessages);

    if (userEmail) {
      localStorage.setItem(
        `${STORAGE_KEY}_${String(userEmail).toLowerCase()}`,
        JSON.stringify(initialMessages)
      );
    }
  };

  const quickQuestions = [
    "I have a property dispute",
    "I want information about divorce",
    "I faced an online fraud",
    "I have an employment dispute",
  ];

  const useQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="legal-assistant-page">

      {/* HEADER */}
      <header className="app-header">
        <div className="header-container">

          <Link to="/dashboard" className="logo">
            ⚖️ AdvocaOne
          </Link>

          <nav className="header-nav">
            <Link to="/dashboard">
              Dashboard
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
      <main className="legal-assistant-container">

        <div className="assistant-header">

          <div>
            <h1>🤖 AI Legal Assistant</h1>

            <p>
              Get general legal information and understand
              your legal issue before consulting a lawyer.
            </p>
          </div>

          <button
            className="clear-chat-button"
            onClick={clearChat}
          >
            🗑️ Clear Chat
          </button>

        </div>

        {/* DISCLAIMER */}
        <div className="assistant-disclaimer">
          <strong>⚠️ Important:</strong>

          <span>
            This AI assistant provides general legal information
            only. It does not provide legal representation or
            replace advice from a qualified lawyer.
          </span>
        </div>

        {/* QUICK QUESTIONS */}
        <div className="quick-question-section">

          <h3>Try asking:</h3>

          <div className="quick-question-list">

            {quickQuestions.map((question) => (
              <button
                key={question}
                className="quick-question"
                onClick={() =>
                  useQuickQuestion(question)
                }
              >
                {question}
              </button>
            ))}

          </div>

        </div>

        {/* CHAT */}
        <section className="assistant-chat">

          <div className="assistant-chat-header">

            <div className="assistant-profile">

              <div className="assistant-avatar">
                🤖
              </div>

              <div>
                <strong>
                  AdvocaOne Legal Assistant
                </strong>

                <span>
                  General legal information
                </span>
              </div>

            </div>

            <div className="assistant-status">
              <span className="status-dot"></span>
              Online
            </div>

          </div>

          <div className="assistant-messages">

            {messages.map((message) => (

              <div
                key={message.id}
                className={`assistant-message-row ${
                  message.sender === "user"
                    ? "user-message-row"
                    : "ai-message-row"
                }`}
              >

                {message.sender === "ai" && (
                  <div className="message-avatar">
                    🤖
                  </div>
                )}

                <div
                  className={`assistant-message ${
                    message.sender === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >
                  {message.text}
                </div>

                {message.sender === "user" && (
                  <div className="message-avatar user-avatar">
                    👤
                  </div>
                )}

              </div>

            ))}

            {isTyping && (
              <div className="assistant-message-row ai-message-row">

                <div className="message-avatar">
                  🤖
                </div>

                <div className="assistant-message ai-message typing-message">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>
            )}

            <div ref={messagesEndRef}></div>

          </div>

          {/* INPUT */}
          <div className="assistant-input-area">

            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Describe your legal issue..."
              rows="2"
              disabled={isTyping}
            />

            <button
              className="send-message-button"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
            >
              ➤
            </button>

          </div>

          <div className="assistant-input-hint">
            Press Enter to send • Shift + Enter for a new line
          </div>

        </section>

      </main>

    </div>
  );
}

export default LegalAssistant;