import { useState } from "react";

export default function CreateChannel({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("public");
  const [password, setPassword] = useState("");
    const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return alert("Channel name is required");

    if (type === "private" && !password.trim())
      return alert("Password is required for private channel");

    try {
      const res = await fetch("http://localhost:5000/api/channels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          type,
          password: type === "private" ? password : undefined,
          description
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create channel");
      } else {
        alert("Channel created successfully");
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-[#2b2d31] p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Create Channel</h2>

        <input
          className="w-full mb-3 p-2 rounded bg-[#313338]"
          placeholder="Channel Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

         <textarea
          className="w-full mb-3 p-2 rounded bg-[#313338] min-h-[80px]"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full mb-3 p-2 rounded bg-[#313338]"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {type === "private" && (
          <input
            type="password"
            className="w-full mb-3 p-2 rounded bg-[#313338]"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
