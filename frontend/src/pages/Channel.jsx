import { useEffect, useState } from "react";
import ChatRoom from "../components/ChatRoom";
import CreateChannel from "./CreateChannel";
import JoinChannelModal from "./JoinChannel";
import { useNavigate } from "react-router-dom";

export default function Channels() {
  const [myChannels, setMyChannels] = useState([]); 
  const [selectedChannel, setSelectedChannel] = useState(null);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);


  // Load channels for current user
    const loadMyChannels = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/channels/my", {
        method: "GET",
        credentials: "include",
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

      <aside className="w-64 bg-[#2b2d31] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#36393f]">
          <h2 className="text-lg font-bold text-white">My Channels</h2>
          
          <button 
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#36393f] hover:bg-[#505256] rounded-lg transition-all text-white"
            title="Profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
        </div>


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
