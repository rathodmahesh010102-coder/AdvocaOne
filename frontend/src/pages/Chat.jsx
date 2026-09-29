import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const CHAT_STORAGE_KEY = "advocaOneChats";
const UPDATE_EVENT = "advocaOneDataUpdated";

// =========================================================
// HELPERS
// =========================================================

function getLoggedInUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("advocaOneLoggedInUser") || "null"
      ) || null
    );
  } catch (error) {
    console.error("Error loading logged-in user:", error);
    return null;
  }
}

function loadChats() {
  try {
    const savedChats =
      JSON.parse(
        localStorage.getItem(CHAT_STORAGE_KEY) || "[]"
      ) || [];

    return Array.isArray(savedChats) ? savedChats : [];
  } catch (error) {
    console.error("Error loading chats:", error);
    return [];
  }
}

function saveChats(chats) {
  localStorage.setItem(
    CHAT_STORAGE_KEY,
    JSON.stringify(chats)
  );

  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT)
  );
}

function getUserIdentifier(user) {
  return (
    user?.email ||
    user?.id ||
    user?.userId ||
    "unknown-user"
  )
    .toString()
    .trim()
    .toLowerCase();
}

function formatTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitial(name) {
  return (
    String(name || "U")
      .trim()
      .charAt(0)
      .toUpperCase() || "U"
  );
}

// =========================================================
// CHAT PAGE
// =========================================================

function Chat() {
  const location = useLocation();

  const user = getLoggedInUser();

  const currentUserId =
    getUserIdentifier(user);

  const [chats, setChats] = useState(
    loadChats()
  );

  const [selectedChatId, setSelectedChatId] =
    useState(null);

  const [messageText, setMessageText] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  // =======================================================
  // LOAD / SYNC CHATS
  // =======================================================

  useEffect(() => {
    const refreshChats = () => {
      setChats(loadChats());
    };

    window.addEventListener(
      "storage",
      refreshChats
    );

    window.addEventListener(
      UPDATE_EVENT,
      refreshChats
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshChats
      );

      window.removeEventListener(
        UPDATE_EVENT,
        refreshChats
      );
    };
  }, []);

  // =======================================================
  // GET USER CHATS
  // =======================================================

  const userChats = useMemo(() => {
    return chats
      .filter((chat) => {
        return (
          chat.clientId === currentUserId ||
          chat.lawyerId === currentUserId
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.updatedAt || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });
  }, [chats, currentUserId]);

  // =======================================================
  // FILTER SEARCH
  // =======================================================

  const filteredChats = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return userChats;
    }

    return userChats.filter((chat) => {
      return (
        String(chat.clientName || "")
          .toLowerCase()
          .includes(search) ||
        String(chat.lawyerName || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [userChats, searchText]);

  // =======================================================
  // AUTO SELECT CHAT
  // =======================================================

  useEffect(() => {
    if (userChats.length === 0) {
      setSelectedChatId(null);
      return;
    }

    const chatExists = userChats.some(
      (chat) => chat.id === selectedChatId
    );

    if (!chatExists) {
      setSelectedChatId(userChats[0].id);
    }
  }, [userChats, selectedChatId]);

  // =======================================================
  // OPEN CHAT FROM URL
  // =======================================================

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    const requestedChatId =
      params.get("chat");

    if (
      requestedChatId &&
      userChats.some(
        (chat) => chat.id === requestedChatId
      )
    ) {
      setSelectedChatId(
        requestedChatId
      );
    }
  }, [location.search, userChats]);

  // =======================================================
  // SELECTED CHAT
  // =======================================================

  const selectedChat = userChats.find(
    (chat) =>
      chat.id === selectedChatId
  );

  // =======================================================
  // CURRENT USER ROLE
  // =======================================================

  const currentUserRole =
    String(user?.role || "")
      .trim()
      .toLowerCase();

  // =======================================================
  // OTHER USER INFORMATION
  // =======================================================

  const getOtherPerson = (chat) => {
    if (!chat) {
      return {
        name: "Chat",
        role: "",
        id: "",
      };
    }

    if (currentUserRole === "lawyer") {
      return {
        name:
          chat.clientName ||
          "Client",
        role: "Client",
        id: chat.clientId,
      };
    }

    return {
      name:
        chat.lawyerName ||
        "Lawyer",
      role: "Lawyer",
      id: chat.lawyerId,
    };
  };

  const otherPerson =
    getOtherPerson(selectedChat);

  // =======================================================
  // UNREAD COUNT
  // =======================================================

  const unreadCount = userChats.reduce(
    (total, chat) => {
      if (
        chat.unreadFor ===
        currentUserId
      ) {
        return (
          total +
          Number(chat.unreadCount || 0)
        );
      }

      return total;
    },
    0
  );

  // =======================================================
  // MARK CHAT AS READ
  // =======================================================

  const markChatAsRead = (
    chatId
  ) => {
    const updatedChats =
      chats.map((chat) => {
        if (
          chat.id !== chatId
        ) {
          return chat;
        }

        if (
          chat.unreadFor !==
          currentUserId
        ) {
          return chat;
        }

        return {
          ...chat,
          unreadCount: 0,
          unreadFor: null,
        };
      });

    setChats(updatedChats);
    saveChats(updatedChats);
  };

  // =======================================================
  // SELECT CHAT
  // =======================================================

  const handleSelectChat = (
    chatId
  ) => {
    setSelectedChatId(chatId);
    markChatAsRead(chatId);
  };

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  const handleSendMessage = () => {
    const trimmedMessage =
      messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!selectedChat) {
      return;
    }

    const now =
      new Date().toISOString();

    const newMessage = {
      id:
        `message_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      senderId:
        currentUserId,

      senderName:
        user?.name ||
        user?.fullName ||
        "User",

      senderRole:
        currentUserRole,

      text:
        trimmedMessage,

      createdAt:
        now,

      read: true,
    };

    const updatedChats =
      chats.map((chat) => {
        if (
          chat.id !==
          selectedChat.id
        ) {
          return chat;
        }

        const recipientId =
          currentUserRole ===
          "lawyer"
            ? chat.clientId
            : chat.lawyerId;

        return {
          ...chat,

          messages: [
            ...(Array.isArray(
              chat.messages
            )
              ? chat.messages
              : []),
            newMessage,
          ],

          lastMessage:
            trimmedMessage,

          lastMessageAt:
            now,

          updatedAt:
            now,

          unreadFor:
            recipientId,

          unreadCount:
            chat.unreadFor ===
            recipientId
              ? Number(
                  chat.unreadCount ||
                    0
                ) + 1
              : 1,
        };
      });

    setChats(updatedChats);
    saveChats(updatedChats);

    setMessageText("");
  };

  // =======================================================
  // ENTER KEY SEND
  // =======================================================

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // =======================================================
  // DELETE CHAT
  // =======================================================

  const handleDeleteChat = (
    chatId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) {
      return;
    }

    const updatedChats =
      chats.filter(
        (chat) =>
          chat.id !== chatId
      );

    setChats(updatedChats);
    saveChats(updatedChats);

    if (
      selectedChatId ===
      chatId
    ) {
      setSelectedChatId(
        updatedChats.length > 0
          ? updatedChats[0].id
          : null
      );
    }
  };

  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (!user) {
    return (
      <div className="container py-5">

        <div className="card shadow-sm">

          <div className="card-body text-center p-5">

            <h3>
              🔐 Login Required
            </h3>

            <p className="text-muted">
              Please login to use
              AdvocaOne Chat.
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
            >
              Login
            </Link>

          </div>

        </div>

      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="advocaone-chat-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container-fluid px-4">

          <Link
            to="/"
            className="navbar-brand fw-bold"
          >
            ⚖️ AdvocaOne
          </Link>

          <div className="d-flex align-items-center gap-3">

            {unreadCount > 0 && (
              <span className="badge bg-danger">
                💬 {unreadCount}
              </span>
            )}

            <Link
              to={
                currentUserRole ===
                "lawyer"
                  ? "/lawyer-dashboard"
                  : currentUserRole ===
                    "admin"
                  ? "/admin-dashboard"
                  : "/dashboard"
              }
              className="btn btn-outline-light"
            >
              ← Dashboard
            </Link>

          </div>

        </div>

      </nav>

      {/* ===================================================
          MAIN CHAT
      =================================================== */}

      <div className="container-fluid py-4 px-3 px-md-4">

        <div className="chat-page-title mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              💬 Messages
            </h2>

            <p className="text-muted mb-0">
              Communicate securely with
              clients and lawyers.
            </p>

          </div>

          <div className="chat-title-stat">
            <strong>
              {userChats.length}
            </strong>

            <span>
              Conversations
            </span>
          </div>

        </div>

        <div className="chat-layout">

          {/* =================================================
              CONVERSATION SIDEBAR
          ================================================= */}

          <aside className="chat-sidebar">

            <div className="chat-sidebar-header">

              <div className="d-flex justify-content-between align-items-center">

                <h5 className="fw-bold mb-0">
                  Conversations
                </h5>

                <span className="badge bg-primary">
                  {userChats.length}
                </span>

              </div>

              <div className="mt-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search conversations..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="chat-conversation-list">

              {filteredChats.length >
              0 ? (
                filteredChats.map(
                  (chat) => {

                    const person =
                      getOtherPerson(
                        chat
                      );

                    const isSelected =
                      chat.id ===
                      selectedChatId;

                    const isUnread =
                      chat.unreadFor ===
                      currentUserId &&
                      Number(
                        chat.unreadCount ||
                          0
                      ) > 0;

                    return (
                      <div
                        key={chat.id}
                        className={`chat-conversation-item ${
                          isSelected
                            ? "active"
                            : ""
                        } ${
                          isUnread
                            ? "unread"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectChat(
                            chat.id
                          )
                        }
                      >

                        <div className="chat-person-avatar">
                          {getInitial(
                            person.name
                          )}
                        </div>

                        <div className="chat-conversation-content">

                          <div className="d-flex justify-content-between gap-2">

                            <strong>
                              {person.name}
                            </strong>

                            <small>
                              {formatTime(
                                chat.lastMessageAt ||
                                  chat.updatedAt
                              )}
                            </small>

                          </div>

                          <div className="chat-person-role">
                            {person.role}
                          </div>

                          <div className="chat-last-message">

                            {chat.lastMessage ||
                              "Start a conversation"}

                          </div>

                        </div>

                        {isUnread && (
                          <span className="chat-unread-badge">
                            {chat.unreadCount}
                          </span>
                        )}

                      </div>
                    );
                  }
                )
              ) : (
                <div className="chat-empty-sidebar">

                  <div>
                    💬
                  </div>

                  <h6>
                    No conversations
                  </h6>

                  <p>
                    Your conversations
                    will appear here.
                  </p>

                </div>
              )}

            </div>

          </aside>

          {/* =================================================
              CHAT WINDOW
          ================================================= */}

          <main className="chat-window">

            {selectedChat ? (
              <>

                {/* CHAT HEADER */}

                <div className="chat-window-header">

                  <div className="d-flex align-items-center gap-3">

                    <div className="chat-person-avatar large">
                      {getInitial(
                        otherPerson.name
                      )}
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        {otherPerson.name}
                      </h5>

                      <div className="chat-online-label">
                        ● {otherPerson.role}
                      </div>

                    </div>

                  </div>

                  <div>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDeleteChat(
                          selectedChat.id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

                {/* MESSAGES */}

                <div className="chat-messages">

                  {Array.isArray(
                    selectedChat.messages
                  ) &&
                  selectedChat.messages
                    .length > 0 ? (
                    selectedChat.messages.map(
                      (
                        message,
                        index
                      ) => {

                        const isMine =
                          String(
                            message.senderId
                          ) ===
                          String(
                            currentUserId
                          );

                        return (
                          <div
                            key={
                              message.id ||
                              index
                            }
                            className={`chat-message-row ${
                              isMine
                                ? "mine"
                                : "theirs"
                            }`}
                          >

                            <div className="chat-message-bubble">

                              <div className="chat-message-text">
                                {message.text}
                              </div>

                              <div className="chat-message-time">
                                {formatTime(
                                  message.createdAt
                                )}
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="chat-no-messages">

                      <div className="chat-no-messages-icon">
                        💬
                      </div>

                      <h5 className="fw-bold">
                        Start the conversation
                      </h5>

                      <p className="text-muted">
                        Send a message to{" "}
                        {otherPerson.name}.
                      </p>

                    </div>
                  )}

                </div>

                {/* MESSAGE INPUT */}

                <div className="chat-input-area">

                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder={`Message ${otherPerson.name}...`}
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-primary chat-send-button"
                    onClick={
                      handleSendMessage
                    }
                    disabled={
                      !messageText.trim()
                    }
                  >
                    Send ➤
                  </button>

                </div>

                <div className="chat-input-hint">
                  Press Enter to send •
                  Shift + Enter for a new line
                </div>

              </>
            ) : (
              <div className="chat-select-empty">

                <div className="chat-select-icon">
                  💬
                </div>

                <h3 className="fw-bold">
                  Your Messages
                </h3>

                <p className="text-muted">
                  Select a conversation
                  from the left to start
                  chatting.
                </p>

              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  );
}

export default Chat;