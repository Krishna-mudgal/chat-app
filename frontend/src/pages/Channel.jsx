import { useEffect, useState } from "react";
import ChatRoom from "../components/ChatRoom"; // placeholder for now
import CreateChannel from "./CreateChannel";
import JoinChannelModal from "./JoinChannel";

export default function Channels() {
  const [myChannels, setMyChannels] = useState([]); // channels user is part of
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

//   const token = localStorage.getItem("token");

  // ==========================
  // Load channels for current user
  // ==========================
  // Load channels for current user
    const loadMyChannels = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/channels/my", {
        method: "GET",
        credentials: "include", // <== token sent via cookie
        });
        const data = await res.json();
        setMyChannels(data.channels || []);
    } catch (err) {
        console.log(err);
    }
    };


  useEffect(() => {
    loadMyChannels();
  }, []);

  return (
    <div className="flex h-screen bg-[#1e1f22] text-gray-200">

      {/* Sidebar */}
      <aside className="w-64 bg-[#2b2d31] p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">My Channels</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {myChannels.map((ch) => (
            <div
              key={ch._id}
              onClick={() => setSelectedChannel(ch)}
              className={`p-2 rounded cursor-pointer ${
                selectedChannel?._id === ch._id
                  ? "bg-[#505256]"
                  : "bg-[#313338] hover:bg-[#3a3c40]"
              }`}
            >
              #{ch.name}
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            className="p-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Channel
          </button>
          <button
            className="p-2 bg-green-600 rounded hover:bg-green-700"
            onClick={() => setShowJoinModal(true)}
          >
            Join Channel
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1">
        {!selectedChannel ? (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl text-gray-400">
              Select a channel to start chatting
            </h1>
          </div>
        ) : (
          <ChatRoom channel={selectedChannel} />
        )}
      </main>

      {/* Modals will go here in next steps */}
      {showCreateModal && 
        <CreateChannel 
            onClose={() => setShowCreateModal(false)}
            onCreated={loadMyChannels}
        />}
      {showJoinModal && 
        <JoinChannelModal 
            onClose={() => setShowJoinModal(false)}
            onJoined={loadMyChannels} 
        />}
    </div>
  );
}
