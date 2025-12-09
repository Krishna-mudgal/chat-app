import { useState } from "react";

export default function JoinChannelModal({ onClose, onJoined }) {
  const [step, setStep] = useState(1); // 1 = enter name, 2 = enter password
  const [channelName, setChannelName] = useState("");
  const [password, setPassword] = useState("");
  const API = import.meta.env.VITE_BACKEND_API_URL;

  const [channelType, setChannelType] = useState(null);

  // Step 1: check channel existence and type
  const handleNext = async () => {
    if (!channelName.trim()) return alert("Enter channel name");

    try {
      const res = await fetch(
        `${API}/channels/check?name=${channelName}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Channel not found");
      } else {
        setChannelType(data.type); 
        if (data.type === "public") {
          handleJoin();
        } else {
          setStep(2);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Step 2: join channel
  const handleJoin = async () => {
    try {
      const res = await fetch(`${API}/channels/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: channelName,
          password: channelType === "private" ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to join channel");
      } else {
        alert("Joined channel successfully");
        onJoined();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-[#2b2d31] p-6 rounded w-96">
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold mb-4">Join Channel</h2>
            <input
              className="w-full mb-3 p-2 rounded bg-[#313338]"
              placeholder="Channel Name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold mb-4">Enter Password</h2>
            <input
              type="password"
              className="w-full mb-3 p-2 rounded bg-[#313338]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                onClick={handleJoin}
              >
                Join
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
