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
  const [socketConnected, setSocketConnected] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [channelMembers, setChannelMembers] = useState([]);
  const API = import.meta.env.VITE_BACKEND_API_URL;
  const SOCKET = import.meta.env.VITE_BACKEND_SOCKET_URL;

  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  let typingTimeout = useRef(null);

  const fetchChannelMembers = async () => {
    try {
      const res = await fetch(`${API}/channels/${channel._id}`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) return;

      if (channel.type === "private" && data.members.length === 0) {
        setChannelMembers([channel.admin]);
      } else {
        setChannelMembers(data.members || []);
      }

      setShowMembersModal(true);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  // Socket Connection 
  useEffect(() => {
    if (!channel?._id) return;

    console.log("🔌 Connecting socket for channel:", channel._id);

    socket.current = io(`${SOCKET}`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("✅ Socket CONNECTED");
      setSocketConnected(true);
      socket.current.emit("joinChannel", { channelId: channel._id });
    });

    socket.current.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
      setSocketConnected(false);
    });

    socket.current.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.current.on("newMessage", (msg) => {
      console.log("📨 SERVER MESSAGE:", msg);
      
      setMessages((prev) => {
        const hasTemp = prev.some(m => m.temp);
        if (hasTemp) {
          return [...prev.filter(m => !m.temp), msg];
        }
        return [...prev, msg];
      });

      const el = messagesRef.current;
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setShowNewMessageIndicator(true);
      }
    });

    socket.current.on("onlineUsers", (users) => {
      console.log("👥 Online users:", users);
      setOnlineUsers(users);
    });

    socket.current.on("typing", (user) => {
      setTypingUsers((prev) => {
        if (!prev.includes(user.username)) return [...prev, user.username];
        return prev;
      });
    });

    socket.current.on("stopTyping", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user.username));
    });

    return () => {
      console.log("🔌 Disconnecting socket");
      socket.current?.disconnect();
    };
  }, [channel?._id]);


  const loadMessages = async (pageNum = 1) => {
    try {
      console.log("📥 Loading page:", pageNum);
      const res = await fetch(
        `${API}/messages/${channel._id}?page=${pageNum}`,
        { credentials: "include" }
      );
      const data = await res.json();
      
      if (data.messages && data.messages.length > 0) {
        if (pageNum === 1) {
          const recentSocketMsg = messages[messages.length - 1]?.temp;
          if (!recentSocketMsg) {
            setMessages(data.messages);
          }
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
        }
        setPage(pageNum);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Load error:", err);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMessages([]);
    loadMessages(1);
  }, [channel._id]);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;

    if (el.scrollTop === 0 && hasMore) {
      const oldHeight = el.scrollHeight;
      loadMessages(page + 1).then(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - oldHeight;
      });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socketConnected) {
      socket.current.emit("typing", { channelId: channel._id });

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.current.emit("stopTyping", { channelId: channel._id });
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socketConnected) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text: newMessage.trim(),
      sender: { username: "You" },
      temp: true
    };

    // console.log("📤 OPTIMISTIC:", optimisticMsg);
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const msgObj = { channelId: channel._id, text: newMessage.trim() };
    socket.current.emit("sendMessage", msgObj);
    socket.current.emit("stopTyping", { channelId: channel._id });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] relative">
      <div 
        className="bg-[#2b2d31] p-4 flex justify-between items-center cursor-pointer hover:bg-[#36393f] transition-all group"
        onClick={fetchChannelMembers}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
            #{channel.name}
          </h2>
          <svg 
            className="w-4 h-4 text-gray-400 group-hover:text-indigo-300 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* <div className="flex items-center gap-2">
          {channel.type === "public" ? (
            <div className="text-sm text-gray-400">
              {onlineUsers.length} online
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Admin
            </div>
          )}
          <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div> */}
      </div>

      {showMembersModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50 md:items-center p-4">
          <div className="bg-[#2b2d31] w-full max-w-md max-h-[70vh] rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#36393f] flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {channel.type === "public" ? "Members" : "Admin"}
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-white text-xl p-1 hover:bg-[#36393f] rounded-full transition-all"
              >
                ×
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {channelMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {channel.type === "public" ? "No members" : "Loading..."}
                </div>
              ) : (
                channelMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-3 hover:bg-[#36393f] rounded-lg mb-2"
                  >
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.username?.[0]?.toUpperCase() || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {member.username}
                      </p>

                      {member.online ? (
                        <span className="flex items-center gap-1 text-sm text-green-400">
                          <span className="w-2 h-2 bg-green-400 rounded-full" />
                          Online
                        </span>
                      ) : member.lastSeen ? (
                        <span className="text-sm text-gray-400">
                          Last seen {new Date(member.lastSeen).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Last seen recently
                        </span>
                      )}

                      {member.username === channel.admin?.username && (
                        <p className="text-sm text-purple-400 mt-1">Channel Admin</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg._id || index} className="flex flex-col">
              <span className="text-sm text-gray-400">
                {msg?.sender?.username || "Unknown"}
              </span>
              <span className="text-white">{msg?.text || "No message"}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="text-gray-400 text-sm px-4 pb-2">
          {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}
      {!socketConnected && (
        <div className="text-yellow-400 text-xs px-4 py-1 text-center bg-yellow-500/10">
          Reconnecting...
        </div>
      )}

      {showNewMessageIndicator && (
        <div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-indigo-600 rounded cursor-pointer z-10 shadow-lg"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewMessageIndicator(false);
          }}
        >
          ↓ New Messages
        </div>
      )}

      <div className="p-4 bg-[#2b2d31] flex gap-2">
        <input
          className="flex-1 p-2 rounded bg-[#313338] text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-700"
          placeholder={socketConnected ? "Type a message..." : "Connecting..."}
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!socketConnected}
        />
        <button
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          onClick={handleSend}
          disabled={!socketConnected || !newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
