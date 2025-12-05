import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

export default function ChatRoom({ channel }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  let typingTimeout = useRef(null);

  // ==========================
  // Connect socket
  // ==========================
  useEffect(() => {
    socket.current = io("http://localhost:5000", { withCredentials: true });

    socket.current.emit("joinChannel", channel._id);

    socket.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Auto-scroll only if near bottom
      const el = messagesRef.current;
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setShowNewMessageIndicator(true);
      }
    });

    socket.current.on("onlineUsers", (users) => setOnlineUsers(users));

    socket.current.on("typing", (user) => {
      setTypingUsers((prev) => {
        if (!prev.includes(user.username)) return [...prev, user.username];
        return prev;
      });
    });

    socket.current.on("stopTyping", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user.username));
    });

    return () => socket.current.disconnect();
  }, [channel._id]);

  // ==========================
  // Load messages (pagination)
  // ==========================
  const loadMessages = async (pageNum = 1) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/channels/${channel._id}/messages?page=${pageNum}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        if (pageNum === 1) setMessages(data.messages);
        else setMessages((prev) => [...data.messages, ...prev]);
        setPage(pageNum);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMessages([]);
    loadMessages(1);
  }, [channel._id]);

  // ==========================
  // Infinite scroll
  // ==========================
  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;

    // Load older messages when scrolled to top
    if (el.scrollTop === 0 && hasMore) {
      const oldHeight = el.scrollHeight;
      loadMessages(page + 1).then(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - oldHeight; // maintain scroll position
      });
    }
  };

  // ==========================
  // Handle input & typing
  // ==========================
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    socket.current.emit("typing", { channelId: channel._id });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.current.emit("stopTyping", { channelId: channel._id });
    }, 1000); // stop typing after 1s
  };

  // ==========================
  // Send message
  // ==========================
  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msgObj = { channelId: channel._id, text: newMessage };
    socket.current.emit("sendMessage", msgObj);
    setNewMessage("");
    socket.current.emit("stopTyping", { channelId: channel._id });
  };

  // ==========================
  // Scroll to bottom on load
  // ==========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] relative">
      {/* Header */}
      <div className="bg-[#2b2d31] p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">#{channel.name}</h2>
        {channel.type === "public" ? (
          <div className="text-sm text-gray-400">
            Members: {onlineUsers.length} online
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            Admin: {channel.admin?.username || "Admin"}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col">
            <span className="text-sm text-gray-400">{msg.sender.username}</span>
            <span className="text-white">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="text-gray-400 text-sm px-4">
          {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      {/* New Message Indicator */}
      {showNewMessageIndicator && (
        <div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-indigo-600 rounded cursor-pointer"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewMessageIndicator(false);
          }}
        >
          New Messages
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-[#2b2d31] flex gap-2">
        <input
          className="flex-1 p-2 rounded bg-[#313338] text-white"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          onClick={handleSend}
        >
          Send
        </button>
      </div>

      {/* Online Users (only public) */}
      {channel.type === "public" && (
        <aside className="absolute top-16 right-0 w-56 bg-[#2b2d31] p-2">
          <h3 className="font-bold mb-2">Online Users</h3>
          {onlineUsers.map((user) => (
            <div key={user._id} className="text-gray-200 text-sm">
              {user.username} {user.online ? "(Online)" : `(Last seen: ${user.lastSeen})`}
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}
